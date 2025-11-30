import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/types'

/**
 * Get user profile (cached per request)
 */
export const getUserProfile = cache(
  async (): Promise<{
    data?: UserProfile
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
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data: data as UserProfile }
  }
)

/**
 * Get current user session (cached per request)
 */
export const getCurrentSession = cache(async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
})

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
