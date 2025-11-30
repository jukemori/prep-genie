import { beforeEach, describe, expect, it } from 'vitest'
import { useMealStore } from '@/stores/meal-store'
import type { Meal } from '@/types'

describe('Meal Store', () => {
  const mockMeal: Meal = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Grilled Chicken Salad',
    description: 'A healthy and delicious grilled chicken salad',
    ingredients: [
      { name: 'Chicken breast', quantity: 200, unit: 'g' },
      { name: 'Mixed greens', quantity: 100, unit: 'g' },
    ],
    instructions: ['Grill chicken', 'Toss with greens'],
    prep_time: 15,
    cook_time: 20,
    servings: 2,
    calories_per_serving: 350,
    protein_per_serving: 40,
    carbs_per_serving: 20,
    fats_per_serving: 12,
    tags: ['healthy', 'high-protein'],
    cuisine_type: 'Mediterranean',
    meal_type: 'lunch',
    difficulty_level: 'easy',
    is_public: false,
    is_ai_generated: false,
    is_seed_meal: false,
    dietary_tags: ['high_protein', 'gluten_free'],
    locale: 'en',
    rating: null,
    image_url: null,
    meal_prep_friendly: false,
    storage_instructions: null,
    reheating_instructions: null,
    storage_duration_days: null,
    container_type: null,
    batch_cooking_multiplier: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  beforeEach(() => {
    // Reset store to initial state before each test
    useMealStore.setState({
      selectedMeal: null,
      mealFilters: {
        mealType: [],
        cuisineType: [],
        dietaryPreference: [],
        maxPrepTime: null,
      },
    })
  })

  describe('Initial State', () => {
    it('initializes with null selectedMeal', () => {
      const state = useMealStore.getState()

      expect(state.selectedMeal).toBeNull()
    })

    it('initializes with empty filters', () => {
      const state = useMealStore.getState()

      expect(state.mealFilters).toEqual({
        mealType: [],
        cuisineType: [],
        dietaryPreference: [],
        maxPrepTime: null,
      })
    })
  })

  describe('setSelectedMeal', () => {
    it('sets selected meal', () => {
      useMealStore.getState().setSelectedMeal(mockMeal)

      const state = useMealStore.getState()
      expect(state.selectedMeal).toEqual(mockMeal)
    })

    it('clears selected meal when set to null', () => {
      // First set a meal
      useMealStore.getState().setSelectedMeal(mockMeal)
      expect(useMealStore.getState().selectedMeal).toEqual(mockMeal)

      // Then clear it
      useMealStore.getState().setSelectedMeal(null)
      expect(useMealStore.getState().selectedMeal).toBeNull()
    })

    it('replaces previously selected meal', () => {
      const anotherMeal: Meal = {
        ...mockMeal,
        id: '223e4567-e89b-12d3-a456-426614174000',
        name: 'Salmon Teriyaki',
      }

      useMealStore.getState().setSelectedMeal(mockMeal)
      expect(useMealStore.getState().selectedMeal?.name).toBe('Grilled Chicken Salad')

      useMealStore.getState().setSelectedMeal(anotherMeal)
      expect(useMealStore.getState().selectedMeal?.name).toBe('Salmon Teriyaki')
    })
  })

  describe('setMealFilters', () => {
    it('updates mealType filter', () => {
      useMealStore.getState().setMealFilters({
        mealType: ['breakfast', 'lunch'],
      })

      const state = useMealStore.getState()
      expect(state.mealFilters.mealType).toEqual(['breakfast', 'lunch'])
    })

    it('updates cuisineType filter', () => {
      useMealStore.getState().setMealFilters({
        cuisineType: ['Japanese', 'Korean'],
      })

      const state = useMealStore.getState()
      expect(state.mealFilters.cuisineType).toEqual(['Japanese', 'Korean'])
    })

    it('updates dietaryPreference filter', () => {
      useMealStore.getState().setMealFilters({
        dietaryPreference: ['vegan', 'gluten-free'],
      })

      const state = useMealStore.getState()
      expect(state.mealFilters.dietaryPreference).toEqual(['vegan', 'gluten-free'])
    })

    it('updates maxPrepTime filter', () => {
      useMealStore.getState().setMealFilters({
        maxPrepTime: 30,
      })

      const state = useMealStore.getState()
      expect(state.mealFilters.maxPrepTime).toBe(30)
    })

    it('updates multiple filters at once', () => {
      useMealStore.getState().setMealFilters({
        mealType: ['dinner'],
        cuisineType: ['Mediterranean'],
        maxPrepTime: 45,
      })

      const state = useMealStore.getState()
      expect(state.mealFilters.mealType).toEqual(['dinner'])
      expect(state.mealFilters.cuisineType).toEqual(['Mediterranean'])
      expect(state.mealFilters.maxPrepTime).toBe(45)
    })

    it('merges with existing filters (partial update)', () => {
      // Set initial filters
      useMealStore.getState().setMealFilters({
        mealType: ['breakfast'],
        cuisineType: ['Japanese'],
      })

      // Update only cuisineType
      useMealStore.getState().setMealFilters({
        cuisineType: ['Korean'],
      })

      const state = useMealStore.getState()
      expect(state.mealFilters.mealType).toEqual(['breakfast']) // Should remain
      expect(state.mealFilters.cuisineType).toEqual(['Korean']) // Should be updated
    })

    it('does not affect other filters when updating one', () => {
      // Set all filters
      useMealStore.getState().setMealFilters({
        mealType: ['lunch'],
        cuisineType: ['Mediterranean'],
        dietaryPreference: ['vegetarian'],
        maxPrepTime: 60,
      })

      // Update only mealType
      useMealStore.getState().setMealFilters({
        mealType: ['dinner'],
      })

      const state = useMealStore.getState()
      expect(state.mealFilters.mealType).toEqual(['dinner'])
      expect(state.mealFilters.cuisineType).toEqual(['Mediterranean'])
      expect(state.mealFilters.dietaryPreference).toEqual(['vegetarian'])
      expect(state.mealFilters.maxPrepTime).toBe(60)
    })
  })

  describe('resetFilters', () => {
    it('clears all filters to initial state', () => {
      // Set some filters
      useMealStore.getState().setMealFilters({
        mealType: ['breakfast', 'lunch'],
        cuisineType: ['Japanese'],
        dietaryPreference: ['vegan'],
        maxPrepTime: 30,
      })

      // Reset filters
      useMealStore.getState().resetFilters()

      const state = useMealStore.getState()
      expect(state.mealFilters).toEqual({
        mealType: [],
        cuisineType: [],
        dietaryPreference: [],
        maxPrepTime: null,
      })
    })

    it('does not affect selectedMeal when resetting filters', () => {
      // Set selected meal and filters
      useMealStore.getState().setSelectedMeal(mockMeal)
      useMealStore.getState().setMealFilters({
        mealType: ['lunch'],
      })

      // Reset filters
      useMealStore.getState().resetFilters()

      const state = useMealStore.getState()
      expect(state.selectedMeal).toEqual(mockMeal) // Should remain
      expect(state.mealFilters.mealType).toEqual([]) // Should be reset
    })
  })

  describe('Complex Scenarios', () => {
    it('handles multiple filter operations correctly', () => {
      // Initial set
      useMealStore.getState().setMealFilters({
        mealType: ['breakfast'],
        maxPrepTime: 15,
      })

      // Add more filters
      useMealStore.getState().setMealFilters({
        cuisineType: ['Japanese'],
      })

      // Update existing filter
      useMealStore.getState().setMealFilters({
        maxPrepTime: 30,
      })

      const state = useMealStore.getState()
      expect(state.mealFilters).toEqual({
        mealType: ['breakfast'],
        cuisineType: ['Japanese'],
        dietaryPreference: [],
        maxPrepTime: 30,
      })
    })

    it('can set and clear selectedMeal multiple times', () => {
      const meal1 = mockMeal
      const meal2: Meal = { ...mockMeal, id: '999', name: 'Meal 2' }

      useMealStore.getState().setSelectedMeal(meal1)
      expect(useMealStore.getState().selectedMeal?.name).toBe('Grilled Chicken Salad')

      useMealStore.getState().setSelectedMeal(null)
      expect(useMealStore.getState().selectedMeal).toBeNull()

      useMealStore.getState().setSelectedMeal(meal2)
      expect(useMealStore.getState().selectedMeal?.name).toBe('Meal 2')

      useMealStore.getState().setSelectedMeal(null)
      expect(useMealStore.getState().selectedMeal).toBeNull()
    })

    it('maintains independent state for selectedMeal and filters', () => {
      // Set meal
      useMealStore.getState().setSelectedMeal(mockMeal)

      // Set filters
      useMealStore.getState().setMealFilters({
        mealType: ['lunch'],
        cuisineType: ['Mediterranean'],
      })

      // Update meal
      useMealStore.getState().setSelectedMeal(null)

      // Filters should be unaffected
      const state = useMealStore.getState()
      expect(state.selectedMeal).toBeNull()
      expect(state.mealFilters.mealType).toEqual(['lunch'])
      expect(state.mealFilters.cuisineType).toEqual(['Mediterranean'])
    })
  })
})
