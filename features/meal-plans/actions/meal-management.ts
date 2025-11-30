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
