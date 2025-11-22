'use server'

import { createClient } from '@/lib/supabase/server'
import { userProfileSchema } from '@/lib/validations/user-profile.schema'
import { calculateTDEE } from '@/lib/nutrition/tdee'
import { calculateMacros } from '@/lib/nutrition/macros'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { UserProfileInsert, UserProfileUpdate } from '@/types'

export async function getUserProfile() {
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

  return { data }
}

export async function createUserProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Parse form data
  const rawData = {
    age: Number(formData.get('age')),
    weight: Number(formData.get('weight')),
    height: Number(formData.get('height')),
    gender: formData.get('gender') as string,
    activityLevel: formData.get('activityLevel') as string,
    goal: formData.get('goal') as string,
    dietaryPreference: formData.get('dietaryPreference') as string,
    allergies: formData.get('allergies')
      ? (formData.get('allergies') as string).split(',').map((a) => a.trim())
      : [],
    budgetLevel: formData.get('budgetLevel') as string,
    cookingSkillLevel: formData.get('cookingSkillLevel') as string,
    timeAvailable: formData.get('timeAvailable')
      ? Number(formData.get('timeAvailable'))
      : null,
  }

  // Validate
  const validation = userProfileSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const validated = validation.data

  // Calculate TDEE
  const tdee = calculateTDEE({
    age: validated.age,
    weight: validated.weight,
    height: validated.height,
    gender: validated.gender as 'male' | 'female' | 'other',
    activityLevel: validated.activityLevel as
      | 'sedentary'
      | 'light'
      | 'moderate'
      | 'active'
      | 'very_active',
  })

  // Calculate macros
  const macros = calculateMacros({
    tdee,
    goal: validated.goal as 'weight_loss' | 'maintain' | 'muscle_gain' | 'balanced',
    weight: validated.weight,
  })

  // Prepare insert data
  const profileData: UserProfileInsert = {
    id: user.id,
    age: validated.age,
    weight: validated.weight,
    height: validated.height,
    gender: validated.gender,
    activity_level: validated.activityLevel,
    goal: validated.goal,
    dietary_preference: validated.dietaryPreference,
    allergies: validated.allergies,
    budget_level: validated.budgetLevel || null,
    cooking_skill_level: validated.cookingSkillLevel || null,
    time_available: validated.timeAvailable || null,
    tdee,
    daily_calorie_target: macros.calories,
    target_protein: macros.protein,
    target_carbs: macros.carbs,
    target_fats: macros.fats,
  }

  const { error } = await supabase.from('user_profiles').insert(profileData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Parse form data
  const rawData = {
    age: Number(formData.get('age')),
    weight: Number(formData.get('weight')),
    height: Number(formData.get('height')),
    gender: formData.get('gender') as string,
    activityLevel: formData.get('activityLevel') as string,
    goal: formData.get('goal') as string,
    dietaryPreference: formData.get('dietaryPreference') as string,
    allergies: formData.get('allergies')
      ? (formData.get('allergies') as string).split(',').map((a) => a.trim())
      : [],
    budgetLevel: formData.get('budgetLevel') as string,
    cookingSkillLevel: formData.get('cookingSkillLevel') as string,
    timeAvailable: formData.get('timeAvailable')
      ? Number(formData.get('timeAvailable'))
      : null,
  }

  // Validate
  const validation = userProfileSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const validated = validation.data

  // Recalculate TDEE and macros
  const tdee = calculateTDEE({
    age: validated.age,
    weight: validated.weight,
    height: validated.height,
    gender: validated.gender as 'male' | 'female' | 'other',
    activityLevel: validated.activityLevel as
      | 'sedentary'
      | 'light'
      | 'moderate'
      | 'active'
      | 'very_active',
  })

  const macros = calculateMacros({
    tdee,
    goal: validated.goal as 'weight_loss' | 'maintain' | 'muscle_gain' | 'balanced',
    weight: validated.weight,
  })

  // Prepare update data
  const updateData: UserProfileUpdate = {
    age: validated.age,
    weight: validated.weight,
    height: validated.height,
    gender: validated.gender,
    activity_level: validated.activityLevel,
    goal: validated.goal,
    dietary_preference: validated.dietaryPreference,
    allergies: validated.allergies,
    budget_level: validated.budgetLevel || null,
    cooking_skill_level: validated.cookingSkillLevel || null,
    time_available: validated.timeAvailable || null,
    tdee,
    daily_calorie_target: macros.calories,
    target_protein: macros.protein,
    target_carbs: macros.carbs,
    target_fats: macros.fats,
  }

  const { error } = await supabase.from('user_profiles').update(updateData).eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  return { success: true }
}
