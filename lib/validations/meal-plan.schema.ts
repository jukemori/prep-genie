import { z } from 'zod'

export const mealPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Name too long'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(['daily', 'weekly', 'custom']).default('weekly'),
})

export type MealPlanForm = z.infer<typeof mealPlanSchema>

export const mealPlanItemSchema = z.object({
  mealPlanId: z.string().uuid(),
  mealId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6).optional(), // 0 = Sunday, 6 = Saturday
  mealTime: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  scheduledDate: z.string().optional(),
  servings: z.number().int().positive().default(1),
})

export type MealPlanItemForm = z.infer<typeof mealPlanItemSchema>

// AI Meal Plan Generation Request
export const aiMealPlanRequestSchema = z.object({
  duration: z.enum(['daily', 'weekly']).default('weekly'),
  mealsPerDay: z.number().int().min(2).max(6).default(3),
  preferences: z
    .object({
      cuisineTypes: z.array(z.string()).optional(),
      excludeIngredients: z.array(z.string()).optional(),
      maxPrepTime: z.number().int().positive().optional(),
      difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
    })
    .optional(),
})

export type AIMealPlanRequest = z.infer<typeof aiMealPlanRequestSchema>
