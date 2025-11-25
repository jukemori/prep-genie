'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { Input } from '@/components/atoms/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select'

interface MealFiltersProps {
  defaultSearch?: string
  defaultCuisine?: string
  defaultMealType?: string
  defaultTag?: string
}

export function MealFilters({
  defaultSearch,
  defaultCuisine,
  defaultMealType,
  defaultTag,
}: MealFiltersProps) {
  const t = useTranslations('meals_page')
  const tMeals = useTranslations('meals')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateFilter(key: string, value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }

      router.push(`/meals?${params.toString()}`)
    })
  }

  function clearTag() {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('tag')
      router.push(`/meals?${params.toString()}`)
    })
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }

      router.push(`/meals?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('search_placeholder')}
            className="pl-9"
            defaultValue={defaultSearch}
            onChange={handleSearchChange}
            disabled={isPending}
          />
        </div>

        {/* Cuisine Type Filter */}
        <Select
          value={defaultCuisine || 'all'}
          onValueChange={(value) => updateFilter('cuisine', value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t('all_cuisines')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_cuisines')}</SelectItem>
            <SelectItem value="japanese">{t('cuisine_japanese')}</SelectItem>
            <SelectItem value="korean">{t('cuisine_korean')}</SelectItem>
            <SelectItem value="mediterranean">{t('cuisine_mediterranean')}</SelectItem>
            <SelectItem value="western">{t('cuisine_western')}</SelectItem>
            <SelectItem value="halal">{t('cuisine_halal')}</SelectItem>
            <SelectItem value="other">{t('cuisine_other')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Meal Type Filter */}
        <Select
          value={defaultMealType || 'all'}
          onValueChange={(value) => updateFilter('mealType', value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t('all_meal_types')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_meal_types')}</SelectItem>
            <SelectItem value="breakfast">{tMeals('breakfast')}</SelectItem>
            <SelectItem value="lunch">{tMeals('lunch')}</SelectItem>
            <SelectItem value="dinner">{tMeals('dinner')}</SelectItem>
            <SelectItem value="snack">{tMeals('snack')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Tag Badge */}
      {defaultTag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('filtered_by_tag')}</span>
          <button
            type="button"
            onClick={clearTag}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium hover:bg-secondary/80 disabled:opacity-50"
          >
            {defaultTag}
            <span className="ml-1 text-muted-foreground hover:text-foreground">✕</span>
          </button>
        </div>
      )}
    </div>
  )
}
