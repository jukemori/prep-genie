'use server'

import { revalidatePath } from 'next/cache'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'
import {
  generateMealPlanPrompt,
  MEAL_PLAN_GENERATOR_SYSTEM_PROMPT,
} from '@/features/meal-plans/prompts/meal-plan-generator'
import { MODELS, openai } from '@/lib/ai/openai'
import { createClient } from '@/lib/supabase/server'
import type { Meal, MealInsert, MealPlanInsert, MealPlanItemInsert } from '@/types'
import type { MealPlanSettings } from './schemas/meal-plan.schema'
import { matchMeals } from './utils/meal-matcher'

export async function getMealPlans() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getMealPlan(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: mealPlan, error: planError } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (planError) {
    return { error: planError.message }
  }

  // Get meal plan items with meals
  const { data: items, error: itemsError } = await supabase
    .from('meal_plan_items')
    .select('*, meals(*)')
    .eq('meal_plan_id', id)
    .order('day_of_week', { ascending: true })
    .order('meal_time', { ascending: true })

  if (itemsError) {
    return { error: itemsError.message }
  }

  return { data: { ...mealPlan, items } }
}

/**
 * Generate AI meal plan using a SINGLE direct OpenAI API call
 * No streaming, no chunking - just like ChatGPT browser (fast!)
 */
export async function generateAIMealPlan(
  cuisineType?: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal'
) {
  // Force dynamic rendering to prevent caching issues with cookies()
  await connection()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'User profile not found' }
  }

  const locale = (profile.locale || 'en') as 'en' | 'ja'

  try {
    // Generate the prompt for 3 unique meals (repeated across 7 days)
    const prompt = generateMealPlanPrompt(profile, locale, cuisineType)

    // Single direct API call - generates 3 meals to be repeated across 7 days
    const completion = await openai.chat.completions.create({
      model: MODELS.GPT5_NANO,
      messages: [
        { role: 'system', content: MEAL_PLAN_GENERATOR_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return { error: 'No response from AI' }
    }

    const saveResult = await saveMealPlan(content, locale)

    if (saveResult.error) {
      return { error: saveResult.error }
    }

    // Revalidate meal plans page
    revalidatePath('/meal-plans')

    return { data: saveResult.data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to generate meal plan' }
  }
}

/**
 * Generate INSTANT meal plan using pre-built database meals
 * No AI calls - uses matching algorithm for instant results (~1 sec)
 */
export async function generateInstantMealPlan(settings: MealPlanSettings) {
  // Force dynamic rendering to prevent caching issues with cookies()
  await connection()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'User profile not found' }
  }

  try {
    // Match meals from database (instant - no AI call)
    const weeklyPlan = await matchMeals({ profile, settings })

    // Get translations for meal plan name
    const locale = (profile.locale || 'en') as 'en' | 'ja'
    const t = await getTranslations('meal_plans_page')
    const planName = `${t('ai_generated_plan')} - ${new Date().toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}`

    // Create meal plan record
    const mealPlanInsert: MealPlanInsert = {
      user_id: user.id,
      name: planName,
      type: 'weekly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_calories: weeklyPlan.totalCalories,
      total_protein: weeklyPlan.totalProtein,
      total_carbs: weeklyPlan.totalCarbs,
      total_fats: weeklyPlan.totalFats,
    }

    const { data: createdPlan, error: planError } = await supabase
      .from('meal_plans')
      .insert(mealPlanInsert)
      .select()
      .single()

    if (planError || !createdPlan) {
      return { error: planError?.message || 'Failed to create meal plan' }
    }

    // Create meal plan items for all 7 days
    const mealPlanItems: MealPlanItemInsert[] = []

    for (const dayPlan of weeklyPlan.days) {
      for (const meal of dayPlan.meals) {
        const mealTime = meal.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack'

        mealPlanItems.push({
          meal_plan_id: createdPlan.id,
          meal_id: meal.id,
          day_of_week: dayPlan.day,
          meal_time: mealTime,
          servings: 1,
          is_completed: false,
        })
      }
    }

    // Batch insert all meal plan items
    if (mealPlanItems.length > 0) {
      const { error: itemsError } = await supabase.from('meal_plan_items').insert(mealPlanItems)
      if (itemsError) {
        return { error: `Failed to create meal plan items: ${itemsError.message}` }
      }
    }

    // Revalidate meal plans page
    revalidatePath('/meal-plans')

    return { data: createdPlan }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to generate meal plan' }
  }
}

export async function saveMealPlan(mealPlanData: string, locale: 'en' | 'ja' = 'en') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const parsedData = JSON.parse(mealPlanData)

    const { week_summary, meals } = parsedData

    if (!week_summary || !meals || !Array.isArray(meals)) {
      return { error: 'Invalid meal plan data structure' }
    }

    // Get translations for meal plan name
    const t = await getTranslations('meal_plans_page')
    const planName = `${t('ai_generated_plan')} - ${new Date().toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}`

    // Create meal plan
    const mealPlanInsert: MealPlanInsert = {
      user_id: user.id,
      name: planName,
      type: 'weekly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_calories: week_summary.total_calories,
      total_protein: week_summary.total_protein,
      total_carbs: week_summary.total_carbs,
      total_fats: week_summary.total_fats,
    }

    const { data: createdPlan, error: planError } = await supabase
      .from('meal_plans')
      .insert(mealPlanInsert)
      .select()
      .single()

    if (planError || !createdPlan) {
      return { error: planError?.message || 'Failed to create meal plan' }
    }

    // Create 3 unique meals and map them by meal_type
    const mealIdMap: Record<string, string> = {}

    for (const meal of meals) {
      const mealInsert: MealInsert = {
        user_id: user.id,
        name: meal.name,
        description: meal.description,
        ingredients: meal.ingredients as never,
        instructions: meal.instructions,
        prep_time: meal.prep_time,
        cook_time: meal.cook_time,
        servings: meal.servings || 1,
        calories_per_serving: meal.nutrition_per_serving.calories,
        protein_per_serving: meal.nutrition_per_serving.protein,
        carbs_per_serving: meal.nutrition_per_serving.carbs,
        fats_per_serving: meal.nutrition_per_serving.fats,
        tags: [],
        cuisine_type: meal.cuisine_type,
        meal_type: meal.meal_type,
        difficulty_level: meal.difficulty_level || 'easy',
        is_public: false,
        is_ai_generated: true,
        image_url: null,
        meal_prep_friendly: false,
        storage_instructions: null,
        reheating_instructions: null,
        storage_duration_days: null,
        container_type: null,
        batch_cooking_multiplier: 1,
      }

      const { data: createdMeal, error: mealError } = await supabase
        .from('meals')
        .insert(mealInsert)
        .select()
        .single()

      if (!mealError && createdMeal) {
        mealIdMap[meal.meal_type] = createdMeal.id
      }
    }

    // Create meal plan items for all 7 days, repeating the 3 meals
    const mealPlanItems: MealPlanItemInsert[] = []
    const mealTypes = ['breakfast', 'lunch', 'dinner'] as const

    for (let day = 0; day < 7; day++) {
      for (const mealType of mealTypes) {
        const mealId = mealIdMap[mealType]
        if (mealId) {
          mealPlanItems.push({
            meal_plan_id: createdPlan.id,
            meal_id: mealId,
            day_of_week: day,
            meal_time: mealType,
            servings: 1,
            is_completed: false,
          })
        }
      }
    }

    // Batch insert all meal plan items
    if (mealPlanItems.length > 0) {
      await supabase.from('meal_plan_items').insert(mealPlanItems)
    }

    return { data: createdPlan }
  } catch (error) {
    return {
      error: `Failed to parse or save meal plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

export async function deleteMealPlan(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('meal_plans')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existing || existing.user_id !== user.id) {
    return { error: 'Not authorized' }
  }

  const { error } = await supabase.from('meal_plans').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/meal-plans')
  return { success: true }
}

export async function toggleMealCompleted(mealPlanItemId: string, isCompleted: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('meal_plan_items')
    .update({ is_completed: isCompleted })
    .eq('id', mealPlanItemId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

type SwapType = 'budget' | 'speed' | 'dietary' | 'macro'
type DietaryRestriction = 'dairy_free' | 'gluten_free' | 'vegan' | 'low_fodmap'
type MacroGoal = 'high_protein' | 'low_carb' | 'low_fat'

interface SwapMealInput {
  mealPlanId: string
  mealPlanItemId: string
  swapType: SwapType
  dietaryRestriction?: DietaryRestriction
  macroGoal?: MacroGoal
}

export async function swapMeal(input: SwapMealInput) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Fetch user profile for preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { error: 'Profile not found' }
    }

    // Fetch the meal plan item and original meal
    const { data: mealPlanItem } = await supabase
      .from('meal_plan_items')
      .select('*, meals(*)')
      .eq('id', input.mealPlanItemId)
      .single()

    if (!mealPlanItem || !mealPlanItem.meals) {
      return { error: 'Meal not found' }
    }

    const originalMeal = mealPlanItem.meals as unknown as Meal

    // Prepare context for AI
    const context = {
      originalMeal: {
        name: originalMeal.name,
        calories: originalMeal.calories_per_serving ?? 0,
        protein: originalMeal.protein_per_serving ?? 0,
        carbs: originalMeal.carbs_per_serving ?? 0,
        fats: originalMeal.fats_per_serving ?? 0,
        mealType: mealPlanItem.meal_time,
      },
      userPreferences: {
        dietaryPreference: profile.dietary_preference || 'omnivore',
        allergies: profile.allergies || [],
        cookingSkill: profile.cooking_skill_level || 'intermediate',
        timeAvailable: profile.time_available || 60,
        budgetLevel: profile.budget_level || 'medium',
      },
      locale: (profile.locale || 'en') as 'en' | 'ja',
    }

    // Import swap prompts
    const {
      MEAL_SWAP_SYSTEM_PROMPT,
      generateBudgetSwapPrompt,
      generateSpeedSwapPrompt,
      generateDietarySwapPrompt,
      generateMacroSwapPrompt,
    } = await import('@/features/meal-plans/prompts/meal-swap')

    // Generate appropriate prompt based on swap type
    let prompt: string
    switch (input.swapType) {
      case 'budget':
        prompt = generateBudgetSwapPrompt(context)
        break
      case 'speed':
        prompt = generateSpeedSwapPrompt(context)
        break
      case 'dietary':
        if (!input.dietaryRestriction) {
          return { error: 'Dietary restriction required for dietary swap' }
        }
        prompt = generateDietarySwapPrompt(context, input.dietaryRestriction)
        break
      case 'macro':
        if (!input.macroGoal) {
          return { error: 'Macro goal required for macro swap' }
        }
        prompt = generateMacroSwapPrompt(context, input.macroGoal)
        break
      default:
        return { error: 'Invalid swap type' }
    }

    // Call AI using direct OpenAI SDK - fast like ChatGPT
    const completion = await openai.chat.completions.create({
      model: MODELS.GPT5_NANO,
      messages: [
        { role: 'system', content: MEAL_SWAP_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return { error: 'Failed to generate swap' }
    }

    const swappedMeal = JSON.parse(content)

    // Create new meal in database
    const { data: newMeal, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        name: swappedMeal.name,
        description: swappedMeal.description,
        ingredients: swappedMeal.ingredients,
        instructions: swappedMeal.instructions,
        prep_time: swappedMeal.prep_time,
        cook_time: swappedMeal.cook_time,
        servings: swappedMeal.servings,
        calories_per_serving: swappedMeal.nutrition_per_serving.calories,
        protein_per_serving: swappedMeal.nutrition_per_serving.protein,
        carbs_per_serving: swappedMeal.nutrition_per_serving.carbs,
        fats_per_serving: swappedMeal.nutrition_per_serving.fats,
        tags: [`swap_${input.swapType}`],
        meal_type: mealPlanItem.meal_time,
        is_ai_generated: true,
      })
      .select()
      .single()

    if (mealError) {
      return { error: mealError.message }
    }

    // Update meal plan item to use new meal
    const { error: updateError } = await supabase
      .from('meal_plan_items')
      .update({ meal_id: newMeal.id })
      .eq('id', input.mealPlanItemId)

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath(`/meal-plans/${input.mealPlanId}`)
    return { data: newMeal }
  } catch (_error) {
    return { error: 'Failed to swap meal' }
  }
}
