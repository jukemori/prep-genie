import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Meal, MealPlan, MealPlanItem } from '@/types'

interface MealPlanItemWithMeal extends MealPlanItem {
  meals: Meal
}

interface MealPlanWithItems extends MealPlan {
  items: MealPlanItemWithMeal[]
}

/**
 * Get all meal plans for the current user (cached per request)
 */
export const getMealPlans = cache(
  async (): Promise<{
    data?: MealPlan[]
    error?: string
  }> => {
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

    return { data: data as MealPlan[] }
  }
)

/**
 * Get a single meal plan with items (cached per request)
 */
export const getMealPlanById = cache(
  async (id: string): Promise<{ data?: MealPlanWithItems; error?: string }> => {
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

    return {
      data: {
        ...(mealPlan as MealPlan),
        items: items as MealPlanItemWithMeal[],
      },
    }
  }
)

/**
 * Get available meals for meal plan generation (cached per request)
 */
export const getAvailableMeals = cache(
  async (
    options: { cuisineType?: string; mealType?: string; limit?: number } = {}
  ): Promise<{ data?: Meal[]; error?: string }> => {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    let query = supabase.from('meals').select('*').or(`user_id.eq.${user.id},is_public.eq.true`)

    if (options.cuisineType && options.cuisineType !== 'any') {
      query = query.eq('cuisine_type', options.cuisineType)
    }

    if (options.mealType) {
      query = query.eq('meal_type', options.mealType)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      return { error: error.message }
    }

    return { data: data as Meal[] }
  }
)
