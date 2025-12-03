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
import type { MealInsert, MealPlanInsert, MealPlanItemInsert } from '@/types'
import type { MealPlanSettings } from '../schemas/meal-plan.schema'
import { matchMeals } from '../utils/meal-matcher'

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
    const planName = `${t('generated_plan')} - ${new Date().toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}`

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
    const planName = `${t('generated_plan')} - ${new Date().toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}`

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
