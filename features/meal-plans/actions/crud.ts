'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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
