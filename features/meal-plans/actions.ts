'use server'

import { revalidatePath } from 'next/cache'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { generateMealPlanPrompt } from '@/features/meal-plans/prompts/meal-plan-generator'
import { openai, MODELS } from '@/lib/ai/openai'
import { createClient } from '@/lib/supabase/server'
import type { Meal, MealInsert, MealPlanInsert, MealPlanItemInsert } from '@/types'

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
    throw new Error('Not authenticated')
  }

  // Get user profile
  const { data: profile, error: profileError} = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('User profile not found')
  }

  try {
    console.log(
      `[generateAIMealPlan] Starting generation for cuisine: ${cuisineType || 'default'}`
    )

    const locale = (profile.locale || 'en') as 'en' | 'ja'
    const prompt = generateMealPlanPrompt(profile, locale, cuisineType)

    console.log(`[generateAIMealPlan] Prompt length: ${prompt.length} characters`)

    const completion = await openai.chat.completions.create({
      model: MODELS.GPT5_NANO,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      response_format: { type: 'json_object' },
    })

    console.log(`[generateAIMealPlan] OpenAI stream started for ${cuisineType || 'default'}`)

    let chunkCount = 0
    let totalContent = ''

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        chunkCount++
        totalContent += content
      }
    }

    console.log(
      `[generateAIMealPlan] Stream complete for ${cuisineType || 'default'}: ${chunkCount} chunks, ${totalContent.length} total characters`
    )

    // Validate JSON
    try {
      JSON.parse(totalContent)
      console.log(`[generateAIMealPlan] JSON validation passed for ${cuisineType || 'default'}`)
    } catch (jsonError) {
      console.error(
        `[generateAIMealPlan] JSON validation FAILED for ${cuisineType || 'default'}:`,
        jsonError
      )
      throw new Error(
        `Invalid JSON response: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`
      )
    }

    // Save directly to database instead of streaming to client
    console.log('[generateAIMealPlan] Saving meal plan to database')
    const result = await saveMealPlan(totalContent, locale)

    if (result.error) {
      throw new Error(result.error)
    }

    console.log(`[generateAIMealPlan] Meal plan saved with ID: ${result.data?.id}`)
    return { data: result.data, error: null }
  } catch (error) {
    console.error(`[generateAIMealPlan] ERROR for ${cuisineType || 'default'}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate meal plan'
    }
  }
}

export async function saveMealPlan(mealPlanData: string, locale: 'en' | 'ja' = 'en') {
  console.log('[saveMealPlan] Starting save process')
  console.log('[saveMealPlan] Received data length:', mealPlanData.length)

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('[saveMealPlan] Not authenticated')
    return { error: 'Not authenticated' }
  }

  console.log('[saveMealPlan] User authenticated:', user.id)

  try {
    console.log('[saveMealPlan] Parsing JSON data...')
    const parsedData = JSON.parse(mealPlanData)
    console.log('[saveMealPlan] JSON parsed successfully')

    const { week_summary, meal_plan } = parsedData

    if (!week_summary || !meal_plan) {
      console.error('[saveMealPlan] Missing required fields:', {
        hasWeekSummary: !!week_summary,
        hasMealPlan: !!meal_plan,
      })
      return { error: 'Invalid meal plan data structure' }
    }

    console.log('[saveMealPlan] Week summary:', week_summary)
    console.log('[saveMealPlan] Number of days:', meal_plan.length)

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

    console.log('[saveMealPlan] Creating meal plan record...')
    const { data: createdPlan, error: planError } = await supabase
      .from('meal_plans')
      .insert(mealPlanInsert)
      .select()
      .single()

    if (planError || !createdPlan) {
      console.error('[saveMealPlan] Failed to create meal plan:', planError)
      return { error: planError?.message || 'Failed to create meal plan' }
    }

    console.log('[saveMealPlan] Meal plan created:', createdPlan.id)

    // Create meals and meal plan items
    let mealsCreated = 0
    let mealsFailed = 0

    for (const day of meal_plan) {
      console.log(`[saveMealPlan] Processing day ${day.day}, ${day.meals.length} meals`)

      for (const meal of day.meals) {
        console.log(`[saveMealPlan] Creating meal: ${meal.name} (${meal.meal_type})`)

        // Create meal
        const mealInsert: MealInsert = {
          user_id: user.id,
          name: meal.name,
          description: meal.description,
          ingredients: meal.ingredients as never,
          instructions: meal.instructions,
          prep_time: meal.prep_time,
          cook_time: meal.cook_time,
          servings: meal.servings,
          calories_per_serving: meal.nutrition_per_serving.calories,
          protein_per_serving: meal.nutrition_per_serving.protein,
          carbs_per_serving: meal.nutrition_per_serving.carbs,
          fats_per_serving: meal.nutrition_per_serving.fats,
          tags: meal.tags,
          cuisine_type: meal.cuisine_type,
          meal_type: meal.meal_type,
          difficulty_level: meal.difficulty_level,
          is_public: false,
          is_ai_generated: true,
          image_url: null,
          meal_prep_friendly: meal.meal_prep_friendly || false,
          storage_instructions: meal.storage_instructions || null,
          reheating_instructions: meal.reheating_instructions || null,
          storage_duration_days: meal.storage_duration_days || null,
          container_type: meal.container_type || null,
          batch_cooking_multiplier: meal.batch_cooking_multiplier || 1,
        }

        const { data: createdMeal, error: mealError } = await supabase
          .from('meals')
          .insert(mealInsert)
          .select()
          .single()

        if (mealError || !createdMeal) {
          console.error(`[saveMealPlan] Failed to create meal "${meal.name}":`, mealError)
          mealsFailed++
          continue // Skip this meal if error
        }

        console.log(`[saveMealPlan] Meal created: ${createdMeal.id}`)
        mealsCreated++

        // Create meal plan item
        const itemInsert: MealPlanItemInsert = {
          meal_plan_id: createdPlan.id,
          meal_id: createdMeal.id,
          day_of_week: day.day - 1, // Convert 1-7 to 0-6
          meal_time: meal.meal_type,
          servings: meal.servings,
          is_completed: false,
        }

        const { error: itemError } = await supabase.from('meal_plan_items').insert(itemInsert)

        if (itemError) {
          console.error(
            `[saveMealPlan] Failed to create meal plan item for meal "${meal.name}":`,
            itemError
          )
        }
      }
    }

    console.log(`[saveMealPlan] Summary: ${mealsCreated} meals created, ${mealsFailed} failed`)

    revalidatePath('/meal-plans')
    console.log('[saveMealPlan] Successfully completed save process')
    return { data: createdPlan }
  } catch (error) {
    console.error('[saveMealPlan] Caught error:', error)
    console.error('[saveMealPlan] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
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

    // Call AI
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
  } catch (error) {
    console.error('Swap meal error:', error)
    return { error: 'Failed to swap meal' }
  }
}
