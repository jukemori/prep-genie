'use server'

import { revalidatePath } from 'next/cache'
import { MODELS, openai } from '@/lib/ai/openai'
import { createClient } from '@/lib/supabase/server'
import type { Meal } from '@/types'

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

interface FindSeedMealOptions {
  mealType: string
  locale: string
  excludeMealId: string
  swapType: SwapType
  dietaryRestriction?: DietaryRestriction
  macroGoal?: MacroGoal
  originalPrepTime?: number
}

/**
 * Find matching seed meals from database (instant, no AI cost)
 * Returns null if no suitable seed meal found
 */
async function findMatchingSeedMeal(options: FindSeedMealOptions): Promise<Meal | null> {
  const supabase = await createClient()

  // Base query: seed meals with same meal type and locale
  let query = supabase
    .from('meals')
    .select('*')
    .eq('is_seed_meal', true)
    .eq('meal_type', options.mealType)
    .eq('locale', options.locale)
    .neq('id', options.excludeMealId)

  // Apply swap-type-specific filters
  switch (options.swapType) {
    case 'budget':
      // Prefer meals with shorter prep time (simpler = cheaper)
      query = query.lte('prep_time', 30).order('prep_time', { ascending: true })
      break
    case 'speed':
      // Faster prep time than original
      if (options.originalPrepTime) {
        query = query.lt('prep_time', options.originalPrepTime)
      }
      query = query.order('prep_time', { ascending: true })
      break
    case 'dietary':
      // Match dietary restriction
      if (options.dietaryRestriction) {
        query = query.contains('dietary_tags', [options.dietaryRestriction])
      }
      break
    case 'macro':
      // Match macro goal
      if (options.macroGoal === 'high_protein') {
        query = query.gte('protein_per_serving', 25)
      } else if (options.macroGoal === 'low_carb') {
        query = query.lte('carbs_per_serving', 20)
      } else if (options.macroGoal === 'low_fat') {
        query = query.lte('fats_per_serving', 10)
      }
      break
  }

  const { data: candidates } = await query.limit(10)

  if (!candidates || candidates.length === 0) {
    return null
  }

  // Return random matching meal for variety
  const randomIndex = Math.floor(Math.random() * candidates.length)
  return candidates[randomIndex] as Meal
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
    const locale = (profile.locale || 'en') as 'en' | 'ja'

    // Validate required parameters for specific swap types
    if (input.swapType === 'dietary' && !input.dietaryRestriction) {
      return { error: 'Dietary restriction required for dietary swap' }
    }
    if (input.swapType === 'macro' && !input.macroGoal) {
      return { error: 'Macro goal required for macro swap' }
    }

    // Step 1: Try to find a matching seed meal (instant, no AI cost)
    const seedMeal = await findMatchingSeedMeal({
      mealType: mealPlanItem.meal_time,
      locale,
      excludeMealId: originalMeal.id,
      swapType: input.swapType,
      dietaryRestriction: input.dietaryRestriction,
      macroGoal: input.macroGoal,
      originalPrepTime: originalMeal.prep_time ?? undefined,
    })

    if (seedMeal) {
      // Use seed meal - instant swap with no AI cost!
      const { error: updateError } = await supabase
        .from('meal_plan_items')
        .update({ meal_id: seedMeal.id })
        .eq('id', input.mealPlanItemId)

      if (updateError) {
        return { error: updateError.message }
      }

      revalidatePath(`/meal-plans/${input.mealPlanId}`)
      return { data: seedMeal }
    }

    // Step 2: Fall back to AI generation if no suitable seed meal found
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
      locale,
    }

    // Import swap prompts
    const {
      MEAL_SWAP_SYSTEM_PROMPT,
      generateBudgetSwapPrompt,
      generateSpeedSwapPrompt,
      generateDietarySwapPrompt,
      generateMacroSwapPrompt,
    } = await import('@/features/meal-plans/prompts/meal-swap')

    // Generate appropriate prompt based on swap type (already validated above)
    let prompt: string
    switch (input.swapType) {
      case 'budget':
        prompt = generateBudgetSwapPrompt(context)
        break
      case 'speed':
        prompt = generateSpeedSwapPrompt(context)
        break
      case 'dietary':
        // Already validated that dietaryRestriction exists
        prompt = generateDietarySwapPrompt(context, input.dietaryRestriction!)
        break
      case 'macro':
        // Already validated that macroGoal exists
        prompt = generateMacroSwapPrompt(context, input.macroGoal!)
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
