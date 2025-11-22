'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProgressLogInsert, ProgressLogUpdate } from '@/types'

export async function getProgressLogs(startDate?: string, endDate?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  let query = supabase
    .from('progress_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('log_date', { ascending: false })

  if (startDate) {
    query = query.gte('log_date', startDate)
  }

  if (endDate) {
    query = query.lte('log_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getProgressLog(date: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', date)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { error: error.message }
  }

  return { data: data || null }
}

export async function logProgress(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const logDate = formData.get('logDate') as string
  const weight = formData.get('weight') ? Number(formData.get('weight')) : null
  const caloriesConsumed = formData.get('caloriesConsumed')
    ? Number(formData.get('caloriesConsumed'))
    : null
  const proteinConsumed = formData.get('proteinConsumed')
    ? Number(formData.get('proteinConsumed'))
    : null
  const carbsConsumed = formData.get('carbsConsumed') ? Number(formData.get('carbsConsumed')) : null
  const fatsConsumed = formData.get('fatsConsumed') ? Number(formData.get('fatsConsumed')) : null
  const notes = formData.get('notes') as string

  // Check if log exists for this date
  const { data: existing } = await supabase
    .from('progress_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('log_date', logDate)
    .single()

  if (existing) {
    // Update existing log
    const updateData: ProgressLogUpdate = {
      weight,
      calories_consumed: caloriesConsumed,
      protein_consumed: proteinConsumed,
      carbs_consumed: carbsConsumed,
      fats_consumed: fatsConsumed,
      notes: notes || null,
    }

    const { data, error } = await supabase
      .from('progress_logs')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/progress')
    return { data }
  } else {
    // Create new log
    const insertData: ProgressLogInsert = {
      user_id: user.id,
      log_date: logDate,
      weight,
      calories_consumed: caloriesConsumed,
      protein_consumed: proteinConsumed,
      carbs_consumed: carbsConsumed,
      fats_consumed: fatsConsumed,
      notes: notes || null,
    }

    const { data, error } = await supabase
      .from('progress_logs')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/progress')
    return { data }
  }
}

export async function deleteProgressLog(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('progress_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/progress')
  return { success: true }
}
