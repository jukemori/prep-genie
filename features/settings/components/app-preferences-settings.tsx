'use client'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Button } from '@/components/atoms/ui/button'
import { Label } from '@/components/atoms/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select'
import type { Tables } from '@/types/database'

interface AppPreferencesSettingsProps {
  profile: Tables<'user_profiles'>
}

export function AppPreferencesSettings({ profile }: AppPreferencesSettingsProps) {
  const t = useTranslations('settings')
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="theme" className="text-base">
          {t('theme')}
        </Label>
        <p className="text-sm text-muted-foreground mb-3">{t('theme_description')}</p>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger id="theme" className="w-full">
            <SelectValue placeholder={t('select_theme')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">{t('theme_light')}</SelectItem>
            <SelectItem value="dark">{t('theme_dark')}</SelectItem>
            <SelectItem value="system">{t('theme_system')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base">{t('default_meal_plan_type')}</Label>
        <p className="text-sm text-muted-foreground mb-3">{t('meal_plan_frequency')}</p>
        <Select defaultValue="weekly">
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('select_plan_type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">{t('daily')}</SelectItem>
            <SelectItem value="weekly">{t('weekly')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base">{t('preferred_cuisines')}</Label>
        <p className="text-sm text-muted-foreground mb-3">{t('cuisines_coming_soon')}</p>
        <Button variant="outline" disabled>
          {t('manage_cuisines')}
        </Button>
      </div>

      <div>
        <Label className="text-base">{t('notifications')}</Label>
        <p className="text-sm text-muted-foreground mb-3">{t('notifications_coming_soon')}</p>
        <Button variant="outline" disabled>
          {t('manage_notifications')}
        </Button>
      </div>
    </div>
  )
}
