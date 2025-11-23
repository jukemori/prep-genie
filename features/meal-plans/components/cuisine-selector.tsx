'use client'

import { Check, Globe } from 'lucide-react'
import { Button } from '@/components/atoms/ui/button'

interface CuisineSelectorProps {
  value?: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal'
  onValueChange: (
    value: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal' | undefined
  ) => void
}

const cuisineOptions = [
  {
    value: 'japanese',
    label: 'Japanese',
    description: 'Umami-rich, balanced meals with rice, fish, and vegetables',
  },
  {
    value: 'korean',
    label: 'Korean',
    description: 'Bold flavors, fermented foods, and banchan side dishes',
  },
  {
    value: 'mediterranean',
    label: 'Mediterranean',
    description: 'Heart-healthy with olive oil, fresh produce, and seafood',
  },
  {
    value: 'western',
    label: 'Western',
    description: 'American and European classics with modern adaptations',
  },
  {
    value: 'halal',
    label: 'Halal',
    description: 'Islamic dietary guidelines with halal-certified ingredients',
  },
] as const

export function CuisineSelector({ value, onValueChange }: CuisineSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {cuisineOptions.map((cuisine) => (
          <Button
            key={cuisine.value}
            variant={value === cuisine.value ? 'default' : 'outline'}
            className="h-auto flex-col items-start justify-start p-4 text-left"
            onClick={() => {
              if (value === cuisine.value) {
                onValueChange(undefined) // Deselect if already selected
              } else {
                onValueChange(cuisine.value as typeof value)
              }
            }}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-semibold">{cuisine.label}</span>
              </div>
              {value === cuisine.value && <Check className="h-4 w-4" />}
            </div>
            <p className="mt-1 text-xs font-normal text-muted-foreground">{cuisine.description}</p>
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
          Clear Selection (Generate Mixed Cuisines)
        </Button>
      )}
    </div>
  )
}
