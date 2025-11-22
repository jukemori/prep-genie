import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Meal } from '@/types'

interface MealStore {
  selectedMeal: Meal | null
  setSelectedMeal: (meal: Meal | null) => void
  mealFilters: {
    mealType: string[]
    cuisineType: string[]
    dietaryPreference: string[]
    maxPrepTime: number | null
  }
  setMealFilters: (filters: Partial<MealStore['mealFilters']>) => void
  resetFilters: () => void
}

const initialFilters: MealStore['mealFilters'] = {
  mealType: [],
  cuisineType: [],
  dietaryPreference: [],
  maxPrepTime: null,
}

export const useMealStore = create<MealStore>()(
  devtools((set) => ({
    selectedMeal: null,
    mealFilters: initialFilters,
    setSelectedMeal: (meal) => set({ selectedMeal: meal }),
    setMealFilters: (filters) =>
      set((state) => ({
        mealFilters: { ...state.mealFilters, ...filters },
      })),
    resetFilters: () => set({ mealFilters: initialFilters }),
  }))
)
