'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/atoms/ui/button'
import { Label } from '@/components/atoms/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select'
import { LanguageSwitcher } from '@/components/molecules/language-switcher'
import type { Tables } from '@/types/database'
import { updateLocalePreferences } from '../actions'

interface LanguageUnitsSettingsProps {
  profile: Tables<'user_profiles'>
}

export function LanguageUnitsSettings({ profile }: LanguageUnitsSettingsProps) {
  const t = useTranslations('settings')
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(
    (profile.unit_system as 'metric' | 'imperial') || 'metric'
  )
  const [currency, setCurrency] = useState<'USD' | 'JPY'>(
    (profile.currency as 'USD' | 'JPY') || 'USD'
  )
  const [isLoading, setIsLoading] = useState(false)

  async function handleSave() {
    setIsLoading(true)
    try {
      const result = await updateLocalePreferences({
        unit_system: unitSystem,
        currency,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(t('preferences_updated'))
      }
    } catch (_error) {
      toast.error(t('preferences_update_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="language" className="text-base">
          {t('language')}
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          {t('language_preference')}
        </p>
        <LanguageSwitcher />
      </div>

      <div>
        <Label htmlFor="unit-system" className="text-base">
          {t('unit_system')}
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          {t('unit_system_preference')}
        </p>
        <Select
          value={unitSystem}
          onValueChange={(value) => setUnitSystem(value as 'metric' | 'imperial')}
        >
          <SelectTrigger id="unit-system" className="w-full">
            <SelectValue placeholder={t('select_unit_system')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="metric">{t('metric')}</SelectItem>
            <SelectItem value="imperial">{t('imperial')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="currency" className="text-base">
          {t('currency')}
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          {t('currency_preference')}
        </p>
        <Select value={currency} onValueChange={(value) => setCurrency(value as 'USD' | 'JPY')}>
          <SelectTrigger id="currency" className="w-full">
            <SelectValue placeholder={t('select_currency')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">$ (USD)</SelectItem>
            <SelectItem value="JPY">¥ (JPY)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? t('saving') : t('save_preferences')}
      </Button>
    </div>
  )
}
