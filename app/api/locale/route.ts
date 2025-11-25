import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { locale } = await request.json()

  if (!['en', 'ja'].includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  // Update database
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('user_profiles')
        .update({ locale, updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }
  } catch (error) {
    console.error('Failed to update locale in database:', error)
    // Don't fail the request if database update fails
  }

  return NextResponse.json({ success: true })
}
