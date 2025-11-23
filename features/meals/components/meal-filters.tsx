'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
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
}

export function MealFilters({ defaultSearch, defaultCuisine, defaultMealType }: MealFiltersProps) {
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
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search meals..."
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
          <SelectValue placeholder="All Cuisines" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cuisines</SelectItem>
          <SelectItem value="japanese">Japanese</SelectItem>
          <SelectItem value="korean">Korean</SelectItem>
          <SelectItem value="mediterranean">Mediterranean</SelectItem>
          <SelectItem value="western">Western</SelectItem>
          <SelectItem value="halal">Halal</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      {/* Meal Type Filter */}
      <Select
        value={defaultMealType || 'all'}
        onValueChange={(value) => updateFilter('mealType', value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Meal Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Meal Types</SelectItem>
          <SelectItem value="breakfast">Breakfast</SelectItem>
          <SelectItem value="lunch">Lunch</SelectItem>
          <SelectItem value="dinner">Dinner</SelectItem>
          <SelectItem value="snack">Snack</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
