'use server'

import { createStreamableValue } from '@ai-sdk/rsc'
import { revalidatePath } from 'next/cache'
import { openai } from '@/lib/ai/openai'
import { generateMealPlanPrompt } from '@/lib/ai/prompts/meal-plan-generator'
import { createClient } from '@/lib/supabase/server'
import type { MealInsert, MealPlanInsert, MealPlanItemInsert } from '@/types'

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

export async function generateAIMealPlan() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('User profile not found')
  }

  const stream = createStreamableValue('')

  ;(async () => {
    const prompt = generateMealPlanPrompt(profile)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      response_format: { type: 'json_object' },
    })

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || ''
      stream.update(content)
    }

    stream.done()
  })()

  return { stream: stream.value }
}

export async function saveMealPlan(mealPlanData: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const parsedData = JSON.parse(mealPlanData)
    const { week_summary, meal_plan } = parsedData

    // Create meal plan
    const mealPlanInsert: MealPlanInsert = {
      user_id: user.id,
      name: `AI Generated Plan - ${new Date().toLocaleDateString()}`,
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

    // Create meals and meal plan items
    for (const day of meal_plan) {
      for (const meal of day.meals) {
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
          continue // Skip this meal if error
        }

        // Create meal plan item
        const itemInsert: MealPlanItemInsert = {
          meal_plan_id: createdPlan.id,
          meal_id: createdMeal.id,
          day_of_week: day.day - 1, // Convert 1-7 to 0-6
          meal_time: meal.meal_type,
          servings: meal.servings,
          is_completed: false,
        }

        await supabase.from('meal_plan_items').insert(itemInsert)
      }
    }

    revalidatePath('/meal-plans')
    return { data: createdPlan }
  } catch (_error) {
    return { error: 'Failed to parse or save meal plan' }
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
