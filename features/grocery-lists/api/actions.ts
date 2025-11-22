'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { GroceryListInsert } from '@/types'

export async function getGroceryLists() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getGroceryList(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function generateGroceryListFromMealPlan(mealPlanId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get meal plan items with meals
  const { data: items, error: itemsError } = await supabase
    .from('meal_plan_items')
    .select('*, meals(*)')
    .eq('meal_plan_id', mealPlanId)

  if (itemsError || !items) {
    return { error: 'Failed to load meal plan items' }
  }

  // Consolidate ingredients
  interface ConsolidatedIngredient {
    name: string
    quantity: number
    unit: string
    category: string
    is_purchased: boolean
  }
  const ingredientMap = new Map<string, ConsolidatedIngredient>()

  for (const item of items) {
    const meal = item.meals
    if (meal && Array.isArray(meal.ingredients)) {
      for (const ingredient of meal.ingredients) {
        const key = `${ingredient.name}-${ingredient.unit}`.toLowerCase()
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)
          if (existing) {
            existing.quantity += ingredient.quantity * (item.servings || 1)
          }
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity * (item.servings || 1),
            unit: ingredient.unit,
            category: ingredient.category || 'other',
            is_purchased: false,
          })
        }
      }
    }
  }

  const consolidatedItems = Array.from(ingredientMap.values())

  // Create grocery list
  const groceryListInsert: GroceryListInsert = {
    user_id: user.id,
    meal_plan_id: mealPlanId,
    name: `Grocery List - ${new Date().toLocaleDateString()}`,
    items: consolidatedItems as never,
    estimated_cost: null,
  }

  const { data, error } = await supabase
    .from('grocery_lists')
    .insert(groceryListInsert)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/grocery-lists')
  return { data }
}

interface GroceryItem {
  name: string
  quantity: number
  unit: string
  category: string
  is_purchased: boolean
}

export async function updateGroceryListItems(id: string, items: GroceryItem[]) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('grocery_lists')
    .update({ items: items as never })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/grocery-lists/${id}`)
  return { success: true }
}

export async function deleteGroceryList(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('grocery_lists')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/grocery-lists')
  return { success: true }
}
