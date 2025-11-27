'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select'

export function LanguageSwitcher() {
  const t = useTranslations('settings')
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  function onSelectChange(newLocale: string) {
    startTransition(async () => {
      try {
        // Set cookie for locale
        const response = await fetch('/api/locale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale: newLocale }),
        })

        if (response.ok) {
          // Refresh page to apply new locale
          window.location.reload()
        }
      } catch {
        // Silently fail
      }
    })
  }

  return (
    <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('language')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ja">日本語</SelectItem>
      </SelectContent>
    </Select>
  )
}
