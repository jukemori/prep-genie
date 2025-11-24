import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditMealForm } from './edit-meal-form'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditMealPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: meal } = await supabase.from('meals').select('*').eq('id', id).single()

  if (!meal) {
    notFound()
  }

  // Only owner can edit
  if (meal.user_id !== user.id) {
    notFound()
  }

  return <EditMealForm meal={meal} />
}
