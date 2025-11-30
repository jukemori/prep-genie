import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deleteMealPlan,
  getMealPlan,
  getMealPlans,
  saveMealPlan,
  swapMeal,
  toggleMealCompleted,
} from '@/features/meal-plans/actions'

// Mock next/cache
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

// Mock next/server
vi.mock('next/server', () => ({
  connection: vi.fn(),
}))

// Mock next-intl
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => Promise.resolve(() => 'AI Generated Meal Plan - 1/1/2025')),
}))

// Mock Vercel AI SDK
vi.mock('ai', () => ({
  streamText: vi.fn(),
}))

// Mock OpenAI SDK
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'gpt-5-nano'),
}))

// Mock OpenAI client (from lib/ai/openai.ts)
vi.mock('@/lib/ai/openai', () => ({
  openai: {},
  MODELS: {
    chat: 'gpt-5-nano',
    embedding: 'text-embedding-3-small',
  },
}))

// Mock Supabase client
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

const mockMealPlanData = {
  id: 'plan-123',
  user_id: 'user-123',
  name: 'Weekly Meal Plan',
  type: 'weekly',
  start_date: '2025-01-01',
  end_date: '2025-01-07',
  total_calories: 14000,
  total_protein: 1050,
  total_carbs: 1400,
  total_fats: 455,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

const mockMealPlanItem = {
  id: 'item-123',
  meal_plan_id: 'plan-123',
  meal_id: 'meal-123',
  day_of_week: 0,
  meal_time: 'breakfast',
  scheduled_date: null,
  is_completed: false,
  servings: 1,
  created_at: '2025-01-01T00:00:00Z',
  meals: {
    id: 'meal-123',
    name: 'Test Meal',
    calories_per_serving: 500,
    protein_per_serving: 30,
    carbs_per_serving: 50,
    fats_per_serving: 15,
  },
}

describe('Meal Plan Actions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default user mock
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  describe('getMealPlans', () => {
    it('returns all meal plans for authenticated user', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockMealPlanData],
              error: null,
            }),
          }),
        }),
      })

      const result = await getMealPlans()

      expect(result.data).toEqual([mockMealPlanData])
      expect(mockFrom).toHaveBeenCalledWith('meal_plans')
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getMealPlans()

      expect(result).toEqual({ error: 'Not authenticated' })
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('handles database errors', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      })

      const result = await getMealPlans()

      expect(result).toEqual({ error: 'Database error' })
    })
  })

  describe('getMealPlan', () => {
    it('returns meal plan with items for authenticated user', async () => {
      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // First call: get meal plan
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockMealPlanData,
                    error: null,
                  }),
                }),
              }),
            }),
          }
        } else {
          // Second call: get meal plan items
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [mockMealPlanItem],
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
      })

      const result = await getMealPlan('plan-123')

      expect(result.data).toEqual({
        ...mockMealPlanData,
        items: [mockMealPlanItem],
      })
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getMealPlan('plan-123')

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('returns error when meal plan not found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      })

      const result = await getMealPlan('nonexistent')

      expect(result).toEqual({ error: 'Not found' })
    })

    it('returns error when items fetch fails', async () => {
      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // First call: get meal plan succeeds
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockMealPlanData,
                    error: null,
                  }),
                }),
              }),
            }),
          }
        } else {
          // Second call: get items fails
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Items fetch failed' },
                  }),
                }),
              }),
            }),
          }
        }
      })

      const result = await getMealPlan('plan-123')

      expect(result).toEqual({ error: 'Items fetch failed' })
    })
  })

  describe('saveMealPlan', () => {
    const validMealPlanJson = JSON.stringify({
      week_summary: {
        total_calories: 14000,
        avg_calories_per_day: 2000,
        total_protein: 1050,
        total_carbs: 1400,
        total_fats: 455,
      },
      meal_plan: [
        {
          day: 1,
          meals: [
            {
              meal_type: 'breakfast',
              name: 'Test Breakfast',
              description: 'Healthy breakfast',
              ingredients: [{ name: 'Eggs', quantity: 2, unit: 'whole' }],
              instructions: ['Cook eggs'],
              prep_time: 5,
              cook_time: 10,
              servings: 1,
              nutrition_per_serving: {
                calories: 300,
                protein: 20,
                carbs: 10,
                fats: 15,
              },
              tags: ['healthy'],
              cuisine_type: 'western',
              difficulty_level: 'easy',
              meal_prep_friendly: true,
              storage_instructions: 'Refrigerate',
              reheating_instructions: 'Microwave',
              storage_duration_days: 3,
              container_type: 'glass',
              batch_cooking_multiplier: 2,
            },
          ],
        },
      ],
    })

    it('saves valid meal plan with meals and items', async () => {
      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // Create meal plan
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockMealPlanData,
                  error: null,
                }),
              }),
            }),
          }
        } else if (callCount === 2) {
          // Create meal
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'meal-123', name: 'Test Breakfast' },
                  error: null,
                }),
              }),
            }),
          }
        } else {
          // Create meal plan item
          return {
            insert: vi.fn().mockResolvedValue({
              error: null,
            }),
          }
        }
      })

      const result = await saveMealPlan(validMealPlanJson)

      expect(result.data).toEqual(mockMealPlanData)
      expect(mockFrom).toHaveBeenCalledWith('meal_plans')
      expect(mockFrom).toHaveBeenCalledWith('meals')
      expect(mockFrom).toHaveBeenCalledWith('meal_plan_items')
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await saveMealPlan(validMealPlanJson)

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('returns error with invalid JSON', async () => {
      const result = await saveMealPlan('invalid json')

      expect(result.error).toContain('Failed to parse')
    })

    it('returns error with missing required fields', async () => {
      const invalidJson = JSON.stringify({
        week_summary: { total_calories: 2000 },
        // Missing meal_plan field
      })

      const result = await saveMealPlan(invalidJson)

      expect(result).toEqual({ error: 'Invalid meal plan data structure' })
    })

    it('handles meal plan creation error', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Creation failed' },
            }),
          }),
        }),
      })

      const result = await saveMealPlan(validMealPlanJson)

      expect(result).toEqual({ error: 'Creation failed' })
    })

    it('continues creating items even if some meals fail', async () => {
      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // Create meal plan succeeds
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockMealPlanData,
                  error: null,
                }),
              }),
            }),
          }
        } else if (callCount === 2) {
          // Create meal fails
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Meal creation failed' },
                }),
              }),
            }),
          }
        } else {
          return {
            insert: vi.fn().mockResolvedValue({
              error: null,
            }),
          }
        }
      })

      const result = await saveMealPlan(validMealPlanJson)

      // Should still return the meal plan even if some meals failed
      expect(result.data).toEqual(mockMealPlanData)
    })
  })

  describe('deleteMealPlan', () => {
    it('deletes meal plan when user is owner', async () => {
      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // Ownership check
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
          // Delete
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }
        }
      })

      const result = await deleteMealPlan('plan-123')

      expect(result).toEqual({ success: true })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meal-plans')
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await deleteMealPlan('plan-123')

      expect(result).toEqual({ error: 'Not authenticated' })
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

      const result = await deleteMealPlan('plan-123')

      expect(result).toEqual({ error: 'Not authorized' })
    })

    it('returns error when meal plan not found', async () => {
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

      const result = await deleteMealPlan('nonexistent')

      expect(result).toEqual({ error: 'Not authorized' })
    })

    it('handles database deletion errors', async () => {
      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // Ownership check succeeds
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
          // Delete fails
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: { message: 'Deletion failed' },
              }),
            }),
          }
        }
      })

      const result = await deleteMealPlan('plan-123')

      expect(result).toEqual({ error: 'Deletion failed' })
    })
  })

  describe('toggleMealCompleted', () => {
    it('updates meal completion status to true', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockMealPlanItem, is_completed: true },
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await toggleMealCompleted('item-123', true)

      expect(result.data).toEqual({ ...mockMealPlanItem, is_completed: true })
    })

    it('updates meal completion status to false', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockMealPlanItem, is_completed: false },
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await toggleMealCompleted('item-123', false)

      expect(result.data).toEqual({ ...mockMealPlanItem, is_completed: false })
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await toggleMealCompleted('item-123', true)

      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('handles database update errors', async () => {
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      })

      const result = await toggleMealCompleted('item-123', true)

      expect(result).toEqual({ error: 'Update failed' })
    })
  })

  describe('swapMeal', () => {
    it('swaps meal with budget swap type', async () => {
      // Mock AI SDK
      const { streamText } = await import('ai')
      vi.mocked(streamText).mockResolvedValue({
        textStream: (async function* () {
          yield JSON.stringify({
            name: 'Budget-Friendly Breakfast',
            description: 'Affordable alternative',
            ingredients: [{ name: 'Oats', quantity: 1, unit: 'cup' }],
            instructions: ['Cook oats'],
            prep_time: 5,
            cook_time: 5,
            servings: 1,
            nutrition_per_serving: {
              calories: 250,
              protein: 10,
              carbs: 40,
              fats: 5,
            },
          })
        })(),
      } as never)

      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // Fetch profile
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'user-123',
                    locale: 'en',
                    dietary_preference: 'omnivore',
                    allergies: [],
                    cooking_skill_level: 'intermediate',
                    time_available: 60,
                    budget_level: 'low',
                  },
                  error: null,
                }),
              }),
            }),
          }
        } else if (callCount === 2) {
          // Fetch meal plan item
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockMealPlanItem,
                  error: null,
                }),
              }),
            }),
          }
        } else if (callCount === 3) {
          // Insert new meal
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'new-meal-123', name: 'Budget-Friendly Breakfast' },
                  error: null,
                }),
              }),
            }),
          }
        } else {
          // Update meal plan item
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }
        }
      })

      const result = await swapMeal({
        mealPlanId: 'plan-123',
        mealPlanItemId: 'item-123',
        swapType: 'budget',
      })

      expect(result.data).toBeDefined()
      expect(result.data?.name).toBe('Budget-Friendly Breakfast')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/meal-plans/plan-123')
    })

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await swapMeal({
        mealPlanId: 'plan-123',
        mealPlanItemId: 'item-123',
        swapType: 'speed',
      })

      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('returns error when profile not found', async () => {
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

      const result = await swapMeal({
        mealPlanId: 'plan-123',
        mealPlanItemId: 'item-123',
        swapType: 'speed',
      })

      expect(result).toEqual({ error: 'Profile not found' })
    })

    it('returns error when meal plan item not found', async () => {
      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // Profile found
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'user-123', locale: 'en' },
                  error: null,
                }),
              }),
            }),
          }
        } else {
          // Meal plan item not found
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }
        }
      })

      const result = await swapMeal({
        mealPlanId: 'plan-123',
        mealPlanItemId: 'nonexistent',
        swapType: 'speed',
      })

      expect(result).toEqual({ error: 'Meal not found' })
    })

    it('returns error when dietary restriction missing for dietary swap', async () => {
      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // Fetch profile
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'user-123', locale: 'en' },
                  error: null,
                }),
              }),
            }),
          }
        } else {
          // Fetch meal plan item
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockMealPlanItem,
                  error: null,
                }),
              }),
            }),
          }
        }
      })

      const result = await swapMeal({
        mealPlanId: 'plan-123',
        mealPlanItemId: 'item-123',
        swapType: 'dietary',
        // Missing dietaryRestriction
      })

      expect(result).toEqual({ error: 'Dietary restriction required for dietary swap' })
    })

    it('returns error when macro goal missing for macro swap', async () => {
      let callCount = 0

      mockFrom.mockImplementation(() => {
        callCount++

        if (callCount === 1) {
          // Fetch profile
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'user-123', locale: 'en' },
                  error: null,
                }),
              }),
            }),
          }
        } else {
          // Fetch meal plan item
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockMealPlanItem,
                  error: null,
                }),
              }),
            }),
          }
        }
      })

      const result = await swapMeal({
        mealPlanId: 'plan-123',
        mealPlanItemId: 'item-123',
        swapType: 'macro',
        // Missing macroGoal
      })

      expect(result).toEqual({ error: 'Macro goal required for macro swap' })
    })
  })
})
