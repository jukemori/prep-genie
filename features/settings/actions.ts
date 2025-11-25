'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateMacros } from '@/features/nutrition/utils/macros'
import { calculateTDEE } from '@/features/nutrition/utils/tdee'
import { createClient } from '@/lib/supabase/server'

interface UpdateProfileData {
  age: number
  weight: number
  height: number
  gender: 'male' | 'female' | 'other'
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'weight_loss' | 'maintain' | 'muscle_gain' | 'balanced'
  dietary_preference: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'halal'
  cooking_skill_level: 'beginner' | 'intermediate' | 'advanced'
  time_available: number
  budget_level: 'low' | 'medium' | 'high'
  allergies: string[]
}

export async function updateProfile(data: UpdateProfileData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Recalculate TDEE and macros based on new profile data
    const tdee = calculateTDEE({
      weight: data.weight,
      height: data.height,
      age: data.age,
      gender: data.gender,
      activityLevel: data.activity_level,
    })

    const macros = calculateMacros({
      tdee,
      goal: data.goal,
      weight: data.weight,
    })

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...data,
        tdee,
        daily_calorie_target: macros.calories,
        target_protein: macros.protein,
        target_carbs: macros.carbs,
        target_fats: macros.fats,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
  } catch (_error) {
    return { error: 'Failed to update profile' }
  }
}

interface UpdateLocalePreferencesData {
  locale: 'en' | 'ja'
  unit_system: 'metric' | 'imperial'
  currency: 'USD' | 'JPY'
}

export async function updateLocalePreferences(data: UpdateLocalePreferencesData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        locale: data.locale,
        unit_system: data.unit_system,
        currency: data.currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
  } catch (_error) {
    return { error: 'Failed to update preferences' }
  }
}

interface UpdateNutritionTargetsData {
  daily_calorie_target: number
  target_protein: number
  target_carbs: number
  target_fats: number
}

export async function updateNutritionTargets(data: UpdateNutritionTargetsData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
  } catch (_error) {
    return { error: 'Failed to update nutrition targets' }
  }
}

export async function resetNutritionTargets() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Fetch current profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { error: 'Profile not found' }
    }

    // Recalculate TDEE and macros
    const tdee = calculateTDEE({
      weight: Number(profile.weight),
      height: Number(profile.height),
      age: profile.age || 30,
      gender: profile.gender || 'other',
      activityLevel: profile.activity_level || 'moderate',
    })

    const macros = calculateMacros({
      tdee,
      goal: profile.goal || 'maintain',
      weight: Number(profile.weight),
    })

    const { error } = await supabase
      .from('user_profiles')
      .update({
        tdee,
        daily_calorie_target: macros.calories,
        target_protein: macros.protein,
        target_carbs: macros.carbs,
        target_fats: macros.fats,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/settings')
    return {
      success: true,
      data: {
        daily_calorie_target: macros.calories,
        target_protein: macros.protein,
        target_carbs: macros.carbs,
        target_fats: macros.fats,
      },
    }
  } catch (_error) {
    return { error: 'Failed to reset nutrition targets' }
  }
}

export async function deleteAccount() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Delete user profile (cascade will delete related data via RLS)
    const { error: profileError } = await supabase.from('user_profiles').delete().eq('id', user.id)

    if (profileError) {
      return { error: profileError.message }
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

    if (authError) {
      return { error: authError.message }
    }

    // Sign out and redirect
    await supabase.auth.signOut()
    redirect('/login')
  } catch (_error) {
    return { error: 'Failed to delete account' }
  }
}
