'use server'

import { createClient } from '@/lib/supabase/server'
import { mealSchema } from '@/lib/validations/meal.schema'
import { revalidatePath } from 'next/cache'
import type { MealInsert, MealUpdate } from '@/types'

export async function getMeals() {
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

  return { data }
}

export async function getMeal(id: string) {
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

  return { data }
}

export async function createMeal(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Parse JSON fields
  const ingredients = JSON.parse(formData.get('ingredients') as string)
  const instructions = JSON.parse(formData.get('instructions') as string)
  const tags = formData.get('tags')
    ? (formData.get('tags') as string).split(',').map((t) => t.trim())
    : []

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    ingredients,
    instructions,
    prepTime: formData.get('prepTime') ? Number(formData.get('prepTime')) : undefined,
    cookTime: formData.get('cookTime') ? Number(formData.get('cookTime')) : undefined,
    servings: Number(formData.get('servings')) || 1,
    caloriesPerServing: formData.get('caloriesPerServing')
      ? Number(formData.get('caloriesPerServing'))
      : undefined,
    proteinPerServing: formData.get('proteinPerServing')
      ? Number(formData.get('proteinPerServing'))
      : undefined,
    carbsPerServing: formData.get('carbsPerServing')
      ? Number(formData.get('carbsPerServing'))
      : undefined,
    fatsPerServing: formData.get('fatsPerServing')
      ? Number(formData.get('fatsPerServing'))
      : undefined,
    tags,
    cuisineType: formData.get('cuisineType') as string,
    mealType: formData.get('mealType') as string,
    difficultyLevel: formData.get('difficultyLevel') as string,
    isPublic: formData.get('isPublic') === 'true',
    imageUrl: formData.get('imageUrl') as string,
  }

  // Validate
  const validation = mealSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const validated = validation.data

  // Prepare insert data
  const mealData: MealInsert = {
    user_id: user.id,
    name: validated.name,
    description: validated.description || null,
    ingredients: validated.ingredients as never, // JSONB type
    instructions: validated.instructions,
    prep_time: validated.prepTime || null,
    cook_time: validated.cookTime || null,
    servings: validated.servings,
    calories_per_serving: validated.caloriesPerServing || null,
    protein_per_serving: validated.proteinPerServing || null,
    carbs_per_serving: validated.carbsPerServing || null,
    fats_per_serving: validated.fatsPerServing || null,
    tags: validated.tags,
    cuisine_type: validated.cuisineType || null,
    meal_type: validated.mealType || null,
    difficulty_level: validated.difficultyLevel || null,
    is_public: validated.isPublic,
    is_ai_generated: false,
    image_url: validated.imageUrl || null,
  }

  const { data, error } = await supabase.from('meals').insert(mealData).select().single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/meals')
  return { data }
}

export async function updateMeal(id: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: existing } = await supabase.from('meals').select('user_id').eq('id', id).single()

  if (!existing || existing.user_id !== user.id) {
    return { error: 'Not authorized' }
  }

  // Parse JSON fields
  const ingredients = JSON.parse(formData.get('ingredients') as string)
  const instructions = JSON.parse(formData.get('instructions') as string)
  const tags = formData.get('tags')
    ? (formData.get('tags') as string).split(',').map((t) => t.trim())
    : []

  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    ingredients,
    instructions,
    prepTime: formData.get('prepTime') ? Number(formData.get('prepTime')) : undefined,
    cookTime: formData.get('cookTime') ? Number(formData.get('cookTime')) : undefined,
    servings: Number(formData.get('servings')) || 1,
    caloriesPerServing: formData.get('caloriesPerServing')
      ? Number(formData.get('caloriesPerServing'))
      : undefined,
    proteinPerServing: formData.get('proteinPerServing')
      ? Number(formData.get('proteinPerServing'))
      : undefined,
    carbsPerServing: formData.get('carbsPerServing')
      ? Number(formData.get('carbsPerServing'))
      : undefined,
    fatsPerServing: formData.get('fatsPerServing')
      ? Number(formData.get('fatsPerServing'))
      : undefined,
    tags,
    cuisineType: formData.get('cuisineType') as string,
    mealType: formData.get('mealType') as string,
    difficultyLevel: formData.get('difficultyLevel') as string,
    isPublic: formData.get('isPublic') === 'true',
    imageUrl: formData.get('imageUrl') as string,
  }

  // Validate
  const validation = mealSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const validated = validation.data

  // Prepare update data
  const updateData: MealUpdate = {
    name: validated.name,
    description: validated.description || null,
    ingredients: validated.ingredients as never,
    instructions: validated.instructions,
    prep_time: validated.prepTime || null,
    cook_time: validated.cookTime || null,
    servings: validated.servings,
    calories_per_serving: validated.caloriesPerServing || null,
    protein_per_serving: validated.proteinPerServing || null,
    carbs_per_serving: validated.carbsPerServing || null,
    fats_per_serving: validated.fatsPerServing || null,
    tags: validated.tags,
    cuisine_type: validated.cuisineType || null,
    meal_type: validated.mealType || null,
    difficulty_level: validated.difficultyLevel || null,
    is_public: validated.isPublic,
    image_url: validated.imageUrl || null,
  }

  const { data, error } = await supabase.from('meals').update(updateData).eq('id', id).select().single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/meals')
  revalidatePath(`/meals/${id}`)
  return { data }
}

export async function deleteMeal(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: existing } = await supabase.from('meals').select('user_id').eq('id', id).single()

  if (!existing || existing.user_id !== user.id) {
    return { error: 'Not authorized' }
  }

  const { error } = await supabase.from('meals').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/meals')
  return { success: true }
}
