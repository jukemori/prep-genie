'use client'

import { LanguageSwitcher } from '@/components/molecules/language-switcher'
import { Label } from '@/components/atoms/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select'
import { Button } from '@/components/atoms/ui/button'
import { toast } from 'sonner'
import { updateLocalePreferences } from '../api/actions'
import type { Tables } from '@/types/database'
import { useState } from 'react'

interface LanguageUnitsSettingsProps {
  profile: Tables<'user_profiles'>
}

export function LanguageUnitsSettings({ profile }: LanguageUnitsSettingsProps) {
  const [unitSystem, setUnitSystem] = useState(profile.unit_system || 'metric')
  const [currency, setCurrency] = useState(profile.currency || 'USD')
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
    } catch (error) {
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
        <Select value={unitSystem} onValueChange={setUnitSystem}>
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
        <Select value={currency} onValueChange={setCurrency}>
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
