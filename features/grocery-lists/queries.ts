import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { GroceryList } from '@/types'

/**
 * Get all grocery lists for the current user (cached per request)
 */
export const getGroceryLists = cache(
  async (): Promise<{
    data?: GroceryList[]
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
      .from('grocery_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { data: data as GroceryList[] }
  }
)

/**
 * Get a single grocery list by ID (cached per request)
 */
export const getGroceryListById = cache(
  async (id: string): Promise<{ data?: GroceryList; error?: string }> => {
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

    return { data: data as GroceryList }
  }
)
