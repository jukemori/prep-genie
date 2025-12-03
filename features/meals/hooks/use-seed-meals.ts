'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Meal } from '@/types'

/**
 * Query key factory for type-safe, hierarchical keys
 * Best Practice: Use hierarchical keys for granular cache control
 */
export const mealKeys = {
  all: ['meals'] as const,
  seed: (locale: string) => [...mealKeys.all, 'seed', locale] as const,
  seedByType: (locale: string, mealType: string) => [...mealKeys.seed(locale), mealType] as const,
  seedByCuisine: (locale: string, cuisine: string) =>
    [...mealKeys.seed(locale), 'cuisine', cuisine] as const,
}

/**
 * Fetch seed meals from database
 */
async function fetchSeedMeals(
  locale: string,
  mealType?: string,
  cuisineType?: string
): Promise<Meal[]> {
  const supabase = createClient()

  let query = supabase.from('meals').select('*').eq('is_seed_meal', true).eq('locale', locale)

  if (mealType) {
    query = query.eq('meal_type', mealType)
  }

  if (cuisineType) {
    query = query.eq('cuisine_type', cuisineType)
  }

  const { data, error } = await query.order('name')

  if (error) {
    throw new Error(error.message)
  }

  return data as Meal[]
}

/**
 * Hook to fetch seed meals with TanStack Query
 * Best Practice: Seed meals rarely change, use long stale time
 */
export function useSeedMeals(locale: string, mealType?: string) {
  return useQuery({
    queryKey: mealType ? mealKeys.seedByType(locale, mealType) : mealKeys.seed(locale),
    queryFn: () => fetchSeedMeals(locale, mealType),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - seed meals rarely change
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache
  })
}

/**
 * Hook to fetch seed meals by cuisine
 */
export function useSeedMealsByCuisine(locale: string, cuisineType: string) {
  return useQuery({
    queryKey: mealKeys.seedByCuisine(locale, cuisineType),
    queryFn: () => fetchSeedMeals(locale, undefined, cuisineType),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Hook to invalidate all seed meals cache
 * Best Practice: Invalidate by prefix for bulk cache clearing
 */
export function useInvalidateSeedMeals() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: mealKeys.all })
  }
}

/**
 * Hook to prefetch seed meals (useful for navigation)
 */
export function usePrefetchSeedMeals() {
  const queryClient = useQueryClient()

  return (locale: string, mealType?: string) => {
    queryClient.prefetchQuery({
      queryKey: mealType ? mealKeys.seedByType(locale, mealType) : mealKeys.seed(locale),
      queryFn: () => fetchSeedMeals(locale, mealType),
      staleTime: 1000 * 60 * 60 * 24,
    })
  }
}
