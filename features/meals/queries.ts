import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Meal } from '@/types'

/**
 * Get all meals for the current user (cached per request)
 */
export const getMeals = cache(
  async (): Promise<{
    data?: Meal[]
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
      .from('meals')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { data: data as Meal[] }
  }
)

/**
 * Get a single meal by ID (cached per request)
 */
export const getMealById = cache(async (id: string): Promise<{ data?: Meal; error?: string }> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase.from('meals').select('*').eq('id', id).single()

  if (error) {
    return { error: error.message }
  }

  // Check if user has access (own meal or public)
  if (data.user_id !== user.id && !data.is_public) {
    return { error: 'Not authorized' }
  }

  return { data: data as Meal }
})

/**
 * Check if a meal is saved to favorites (cached per request)
 */
export const checkMealIsSaved = cache(
  async (mealId: string): Promise<{ isSaved: boolean; error?: string }> => {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { isSaved: false, error: 'Not authenticated' }
    }

    const { data } = await supabase
      .from('saved_meals')
      .select('id')
      .eq('user_id', user.id)
      .eq('meal_id', mealId)
      .single()

    return { isSaved: !!data }
  }
)

/**
 * Get current user (cached per request)
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
