'use client'

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
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="theme" className="text-base">
          Theme
        </Label>
        <p className="text-sm text-muted-foreground mb-3">Choose your preferred color scheme</p>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger id="theme" className="w-full">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base">Default Meal Plan Type</Label>
        <p className="text-sm text-muted-foreground mb-3">Your preferred meal planning frequency</p>
        <Select defaultValue="weekly">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select default plan type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-base">Preferred Cuisines</Label>
        <p className="text-sm text-muted-foreground mb-3">Cuisine types you enjoy (coming soon)</p>
        <Button variant="outline" disabled>
          Manage Cuisines
        </Button>
      </div>

      <div>
        <Label className="text-base">Notifications</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Email notification preferences (coming soon)
        </p>
        <Button variant="outline" disabled>
          Manage Notifications
        </Button>
      </div>
    </div>
  )
}
