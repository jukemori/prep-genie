import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkMealIsSaved,
  createMeal,
  deleteMeal,
  getMeal,
  getMeals,
  removeMealFromFavorites,
  saveMealToFavorites,
  updateMeal,
} from '@/features/meals/actions'

// Mock next/cache
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

// Mock Supabase client
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const _mockInsert = vi.fn()
const _mockOr = vi.fn()
const _mockOrder = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

const mockMealData = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'user-123',
  name: 'Test Meal',
  description: 'Test description',
  ingredients: [{ name: 'Ingredient 1', quantity: 100, unit: 'g' }],
  instructions: ['Step 1'],
  prep_time: 10,
  cook_time: 20,
  servings: 2,
  calories_per_serving: 300,
  protein_per_serving: 25,
  carbs_per_serving: 30,
  fats_per_serving: 10,
  tags: ['healthy'],
  cuisine_type: 'Mediterranean',
  meal_type: 'lunch',
  difficulty_level: 'easy',
  is_public: false,
  is_ai_generated: false,
  rating: null,
  image_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

describe('Meal Actions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default user mock
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  describe('getMeals', () => {
    it('returns user meals and public meals', async () => {
      const meals = [mockMealData, { ...mockMealData, id: '456', is_public: true }]

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: meals,
              error: null,
            }),
          }),
        }),
      })

      const result = await getMeals()

      expect(result.data).toEqual(meals)
      expect(mockFrom).toHaveBeenCalledWith('meals')
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getMeals()

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('handles database errors', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      })

      const result = await getMeals()

      expect(result).toEqual({ error: 'Database error' })
    })
  })

  describe('getMeal', () => {
    it('returns meal for authenticated user', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockMealData,
              error: null,
            }),
          }),
        }),
      })

      const result = await getMeal('123e4567-e89b-12d3-a456-426614174000')

      expect(result.data).toEqual(mockMealData)
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getMeal('123')

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('returns error when meal not found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      })

      const result = await getMeal('nonexistent')

      expect(result).toEqual({ error: 'Not found' })
    })

    it('returns error when user not authorized to view private meal', async () => {
      const privateMeal = { ...mockMealData, user_id: 'other-user', is_public: false }

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: privateMeal,
              error: null,
            }),
          }),
        }),
      })

      const result = await getMeal('123')

      expect(result).toEqual({ error: 'Not authorized' })
    })

    it('returns public meal even if owned by different user', async () => {
      const publicMeal = { ...mockMealData, user_id: 'other-user', is_public: true }

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: publicMeal,
              error: null,
            }),
          }),
        }),
      })

      const result = await getMeal('123')

      expect(result.data).toEqual(publicMeal)
    })
  })

  describe('createMeal', () => {
    it('creates meal with valid data and sets user_id from auth context', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockMealData,
              error: null,
            }),
          }),
        }),
      })

      const formData = new FormData()
      formData.append('name', 'Test Meal')
      formData.append('description', 'Test description')
      formData.append(
        'ingredients',
        JSON.stringify([{ name: 'Ingredient 1', quantity: 100, unit: 'g' }])
      )
      formData.append('instructions', JSON.stringify(['Step 1']))
      formData.append('servings', '2')
      formData.append('caloriesPerServing', '300')

      const result = await createMeal(formData)

      expect(result.data).toEqual(mockMealData)
      expect(result.data?.user_id).toBe('user-123')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meals')
    })

    it('returns validation error with invalid data', async () => {
      const formData = new FormData()
      formData.append('name', '') // Empty name should fail validation
      formData.append('ingredients', JSON.stringify([]))
      formData.append('instructions', JSON.stringify([]))

      const result = await createMeal(formData)

      expect(result).toHaveProperty('error')
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      formData.append('name', 'Test')

      const result = await createMeal(formData)

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('handles database errors', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      })

      const formData = new FormData()
      formData.append('name', 'Test Meal')
      formData.append('description', 'Test description')
      formData.append('ingredients', JSON.stringify([{ name: 'Test', quantity: 1, unit: 'g' }]))
      formData.append('instructions', JSON.stringify(['Step 1']))
      formData.append('servings', '1')

      const result = await createMeal(formData)

      expect(result).toEqual({ error: 'Insert failed' })
    })
  })

  describe('updateMeal', () => {
    it('updates existing meal and revalidates paths', async () => {
      let callCount = 0

      mockFrom.mockImplementation((table: string) => {
        callCount++

        if (callCount === 1) {
          // First call: ownership check
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { user_id: 'user-123' },
                  error: null,
                }),
              }),
            }),
          }
        } else {
          // Second call: update
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { ...mockMealData, name: 'Updated Meal' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
      })

      const formData = new FormData()
      formData.append('name', 'Updated Meal')
      formData.append('description', 'Updated description')
      formData.append('ingredients', JSON.stringify([{ name: 'Test', quantity: 1, unit: 'g' }]))
      formData.append('instructions', JSON.stringify(['Step 1']))
      formData.append('servings', '2')

      const result = await updateMeal('123', formData)

      expect(result.data).toBeDefined()
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meals')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meals/123')
    })

    it('returns error when user not authorized', async () => {
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'other-user' },
              error: null,
            }),
          }),
        }),
      }))

      const formData = new FormData()
      formData.append('name', 'Updated')

      const result = await updateMeal('123', formData)

      expect(result).toEqual({ error: 'Not authorized' })
    })

    it('returns error when meal not found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      const formData = new FormData()
      const result = await updateMeal('nonexistent', formData)

      expect(result).toEqual({ error: 'Not authorized' })
    })
  })

  describe('deleteMeal', () => {
    it('deletes existing meal', async () => {
      // Mock ownership check
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'user-123' },
              error: null,
            }),
          }),
        }),
      })

      // Mock delete
      mockFrom.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      })

      const result = await deleteMeal('123')

      expect(result).toEqual({ success: true })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meals')
    })

    it('returns error when user not authorized', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'other-user' },
              error: null,
            }),
          }),
        }),
      })

      const result = await deleteMeal('123')

      expect(result).toEqual({ error: 'Not authorized' })
    })

    it('returns error when meal not found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })

      const result = await deleteMeal('nonexistent')

      expect(result).toEqual({ error: 'Not authorized' })
    })
  })

  describe('saveMealToFavorites', () => {
    it('saves meal to favorites', async () => {
      // Mock check for existing
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      })

      // Mock insert
      mockFrom.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'saved-123', user_id: 'user-123', meal_id: 'meal-123' },
              error: null,
            }),
          }),
        }),
      })

      const result = await saveMealToFavorites('meal-123')

      expect(result.data).toBeDefined()
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meals')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meals/meal-123')
    })

    it('returns error if meal already saved', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'existing' },
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await saveMealToFavorites('meal-123')

      expect(result).toEqual({ error: 'Meal already saved to favorites' })
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await saveMealToFavorites('meal-123')

      expect(result).toEqual({ error: 'Not authenticated' })
    })
  })

  describe('removeMealFromFavorites', () => {
    it('removes meal from favorites', async () => {
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      })

      const result = await removeMealFromFavorites('meal-123')

      expect(result).toEqual({ success: true })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meals')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meals/meal-123')
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await removeMealFromFavorites('meal-123')

      expect(result).toEqual({ error: 'Not authenticated' })
    })
  })

  describe('checkMealIsSaved', () => {
    it('returns true if meal is saved', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'saved-123' },
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await checkMealIsSaved('meal-123')

      expect(result).toEqual({ isSaved: true })
    })

    it('returns false if meal is not saved', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await checkMealIsSaved('meal-123')

      expect(result).toEqual({ isSaved: false })
    })

    it('returns false when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await checkMealIsSaved('meal-123')

      expect(result).toEqual({ isSaved: false })
    })
  })
})
