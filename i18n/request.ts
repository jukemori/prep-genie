import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'ja'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async () => {
  // Get locale from cookie or default to 'en'
  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as Locale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
