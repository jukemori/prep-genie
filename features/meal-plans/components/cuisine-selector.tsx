'use client'

import { Check, Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/ui/button'

interface CuisineSelectorProps {
  value?: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal'
  onValueChange: (
    value: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal' | undefined
  ) => void
}

const cuisineKeys = ['japanese', 'korean', 'mediterranean', 'western', 'halal'] as const

export function CuisineSelector({ value, onValueChange }: CuisineSelectorProps) {
  const t = useTranslations('generate_meal_plan_page')

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {cuisineKeys.map((cuisineKey) => (
          <Button
            key={cuisineKey}
            variant={value === cuisineKey ? 'default' : 'outline'}
            className="h-auto flex-col items-start justify-start p-4 text-left"
            data-cuisine={cuisineKey}
            data-selected={value === cuisineKey ? 'true' : 'false'}
            onClick={() => {
              if (value === cuisineKey) {
                onValueChange(undefined) // Deselect if already selected
              } else {
                onValueChange(cuisineKey)
              }
            }}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-semibold">{t(`cuisine_${cuisineKey}`)}</span>
              </div>
              {value === cuisineKey && <Check className="h-4 w-4" />}
            </div>
            <p className="mt-1 text-xs font-normal text-muted-foreground">
              {t(`cuisine_${cuisineKey}_desc`)}
            </p>
          </Button>
        ))}
      </div>

      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onValueChange(undefined)}
          className="w-full"
        >
          {t('clear_cuisine_selection')}
        </Button>
      )}
    </div>
  )
}
