import { describe, expect, it } from 'vitest'
import {
  aiMealPlanRequestSchema,
  mealPlanItemSchema,
  mealPlanSchema,
} from '@/features/meal-plans/schemas/meal-plan.schema'

describe('Meal Plan Schema Validation', () => {
  describe('mealPlanSchema', () => {
    it('validates meal plan with all fields', () => {
      const mealPlan = {
        name: 'My Weekly Plan',
        startDate: '2025-01-01',
        endDate: '2025-01-07',
        type: 'weekly' as const,
      }

      const result = mealPlanSchema.safeParse(mealPlan)

      expect(result.success).toBe(true)
    })

    it('validates minimal meal plan (name only)', () => {
      const mealPlan = {
        name: 'Quick Plan',
      }

      const result = mealPlanSchema.safeParse(mealPlan)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('weekly') // default
      }
    })

    it('rejects empty name', () => {
      const mealPlan = {
        name: '',
      }

      const result = mealPlanSchema.safeParse(mealPlan)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Plan name is required')
      }
    })

    it('rejects name over 100 characters', () => {
      const mealPlan = {
        name: 'a'.repeat(101),
      }

      const result = mealPlanSchema.safeParse(mealPlan)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Name too long')
      }
    })

    it('accepts all valid types', () => {
      const types = ['daily', 'weekly', 'custom'] as const

      for (const type of types) {
        const mealPlan = {
          name: 'Test Plan',
          type,
        }

        const result = mealPlanSchema.safeParse(mealPlan)
        expect(result.success).toBe(true)
      }
    })

    it('sets default type to weekly', () => {
      const mealPlan = {
        name: 'Test Plan',
      }

      const result = mealPlanSchema.safeParse(mealPlan)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('weekly')
      }
    })

    it('accepts optional startDate and endDate', () => {
      const mealPlan = {
        name: 'Test Plan',
        startDate: '2025-01-01',
        endDate: '2025-01-07',
      }

      const result = mealPlanSchema.safeParse(mealPlan)

      expect(result.success).toBe(true)
    })
  })

  describe('mealPlanItemSchema', () => {
    it('validates valid meal plan item', () => {
      const item = {
        mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
        mealId: '123e4567-e89b-12d3-a456-426614174001',
        dayOfWeek: 3,
        mealTime: 'dinner' as const,
        scheduledDate: '2025-01-03',
        servings: 2,
      }

      const result = mealPlanItemSchema.safeParse(item)

      expect(result.success).toBe(true)
    })

    it('rejects invalid UUID for mealPlanId', () => {
      const item = {
        mealPlanId: 'invalid-uuid',
        mealId: '123e4567-e89b-12d3-a456-426614174001',
        mealTime: 'dinner' as const,
      }

      const result = mealPlanItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })

    it('rejects invalid UUID for mealId', () => {
      const item = {
        mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
        mealId: 'invalid-uuid',
        mealTime: 'dinner' as const,
      }

      const result = mealPlanItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })

    it('rejects dayOfWeek less than 0', () => {
      const item = {
        mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
        mealId: '123e4567-e89b-12d3-a456-426614174001',
        dayOfWeek: -1,
        mealTime: 'dinner' as const,
      }

      const result = mealPlanItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })

    it('rejects dayOfWeek greater than 6', () => {
      const item = {
        mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
        mealId: '123e4567-e89b-12d3-a456-426614174001',
        dayOfWeek: 7,
        mealTime: 'dinner' as const,
      }

      const result = mealPlanItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })

    it('accepts all valid meal times', () => {
      const mealTimes = ['breakfast', 'lunch', 'dinner', 'snack'] as const

      for (const mealTime of mealTimes) {
        const item = {
          mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
          mealId: '123e4567-e89b-12d3-a456-426614174001',
          mealTime,
        }

        const result = mealPlanItemSchema.safeParse(item)
        expect(result.success).toBe(true)
      }
    })

    it('sets default servings to 1', () => {
      const item = {
        mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
        mealId: '123e4567-e89b-12d3-a456-426614174001',
        mealTime: 'dinner' as const,
      }

      const result = mealPlanItemSchema.safeParse(item)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.servings).toBe(1)
      }
    })

    it('rejects servings less than or equal to 0', () => {
      const item = {
        mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
        mealId: '123e4567-e89b-12d3-a456-426614174001',
        mealTime: 'dinner' as const,
        servings: 0,
      }

      const result = mealPlanItemSchema.safeParse(item)

      expect(result.success).toBe(false)
    })

    it('accepts optional dayOfWeek and scheduledDate', () => {
      const item = {
        mealPlanId: '123e4567-e89b-12d3-a456-426614174000',
        mealId: '123e4567-e89b-12d3-a456-426614174001',
        mealTime: 'dinner' as const,
      }

      const result = mealPlanItemSchema.safeParse(item)

      expect(result.success).toBe(true)
    })
  })

  describe('aiMealPlanRequestSchema', () => {
    it('validates AI request with all preferences', () => {
      const request = {
        duration: 'weekly' as const,
        mealsPerDay: 3,
        preferences: {
          cuisineTypes: ['Japanese', 'Mediterranean'],
          excludeIngredients: ['peanuts', 'shellfish'],
          maxPrepTime: 45,
          difficultyLevel: 'medium' as const,
        },
      }

      const result = aiMealPlanRequestSchema.safeParse(request)

      expect(result.success).toBe(true)
    })

    it('validates minimal AI request with defaults', () => {
      const request = {}

      const result = aiMealPlanRequestSchema.safeParse(request)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.duration).toBe('weekly')
        expect(result.data.mealsPerDay).toBe(3)
      }
    })

    it('rejects mealsPerDay less than 2', () => {
      const request = {
        mealsPerDay: 1,
      }

      const result = aiMealPlanRequestSchema.safeParse(request)

      expect(result.success).toBe(false)
    })

    it('rejects mealsPerDay greater than 6', () => {
      const request = {
        mealsPerDay: 7,
      }

      const result = aiMealPlanRequestSchema.safeParse(request)

      expect(result.success).toBe(false)
    })

    it('accepts valid duration values', () => {
      const durations = ['daily', 'weekly'] as const

      for (const duration of durations) {
        const request = {
          duration,
        }

        const result = aiMealPlanRequestSchema.safeParse(request)
        expect(result.success).toBe(true)
      }
    })

    it('accepts all valid difficulty levels', () => {
      const difficulties = ['easy', 'medium', 'hard'] as const

      for (const difficultyLevel of difficulties) {
        const request = {
          preferences: {
            difficultyLevel,
          },
        }

        const result = aiMealPlanRequestSchema.safeParse(request)
        expect(result.success).toBe(true)
      }
    })

    it('accepts optional preferences object', () => {
      const request = {
        duration: 'weekly' as const,
        mealsPerDay: 4,
      }

      const result = aiMealPlanRequestSchema.safeParse(request)

      expect(result.success).toBe(true)
    })

    it('accepts empty arrays for cuisineTypes and excludeIngredients', () => {
      const request = {
        preferences: {
          cuisineTypes: [],
          excludeIngredients: [],
        },
      }

      const result = aiMealPlanRequestSchema.safeParse(request)

      expect(result.success).toBe(true)
    })

    it('rejects negative maxPrepTime', () => {
      const request = {
        preferences: {
          maxPrepTime: -30,
        },
      }

      const result = aiMealPlanRequestSchema.safeParse(request)

      expect(result.success).toBe(false)
    })
  })
})
