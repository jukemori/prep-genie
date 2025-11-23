'use client'

import { useState } from 'react'
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
        toast.success('Preferences updated successfully!')
      }
    } catch (_error) {
      toast.error('Failed to update preferences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="language" className="text-base">
          Language
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose your preferred language for the app interface
        </p>
        <LanguageSwitcher />
      </div>

      <div>
        <Label htmlFor="unit-system" className="text-base">
          Unit System
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select your preferred measurement system
        </p>
        <Select
          value={unitSystem}
          onValueChange={(value) => setUnitSystem(value as 'metric' | 'imperial')}
        >
          <SelectTrigger id="unit-system" className="w-full">
            <SelectValue placeholder="Select unit system" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="metric">Metric (kg, cm, mL)</SelectItem>
            <SelectItem value="imperial">Imperial (lb, ft/in, oz)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="currency" className="text-base">
          Currency
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose your preferred currency for cost displays
        </p>
        <Select value={currency} onValueChange={(value) => setCurrency(value as 'USD' | 'JPY')}>
          <SelectTrigger id="currency" className="w-full">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">$ (USD)</SelectItem>
            <SelectItem value="JPY">¥ (JPY)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  )
}
