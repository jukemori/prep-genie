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

// ============================================
// Database-based Meal Plan Generation Schemas
// ============================================

/**
 * Cuisine types for filtering pre-built meals
 */
export const cuisineTypeSchema = z.enum([
  'japanese',
  'korean',
  'mediterranean',
  'western',
  'halal',
  'any',
])

export type CuisineType = z.infer<typeof cuisineTypeSchema>

/**
 * Dietary preference for filtering meals
 */
export const dietaryPreferenceSchema = z.enum([
  'omnivore',
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal',
])

export type DietaryPreference = z.infer<typeof dietaryPreferenceSchema>

/**
 * Common allergies for filtering meals
 */
export const allergySchema = z.enum(['dairy', 'gluten', 'nuts', 'eggs', 'shellfish', 'soy', 'fish'])

export type Allergy = z.infer<typeof allergySchema>

/**
 * User goal for meal scoring
 */
export const goalSchema = z.enum(['weight_loss', 'maintain', 'muscle_gain', 'balanced'])

export type Goal = z.infer<typeof goalSchema>

/**
 * Variety level for meal selection
 */
export const varietyLevelSchema = z.enum(['low', 'medium', 'high'])

export type VarietyLevel = z.infer<typeof varietyLevelSchema>

/**
 * Locale for i18n support
 */
export const localeSchema = z.enum(['en', 'ja'])

export type Locale = z.infer<typeof localeSchema>

/**
 * Meal plan generation settings (user input at generation time)
 * Used for the new database-based instant generation
 */
export const mealPlanSettingsSchema = z.object({
  // Cuisine selection
  cuisineType: cuisineTypeSchema.default('any'),

  // Meals per day (affects snack inclusion)
  mealsPerDay: z
    .union([
      z.literal(3), // breakfast, lunch, dinner
      z.literal(4), // + afternoon snack
      z.literal(5), // + morning & afternoon snacks
    ])
    .default(3),

  // Variety level
  varietyLevel: varietyLevelSchema.default('medium'),

  // Max prep + cook time per meal (minutes)
  prepTimeMax: z.number().min(10).max(120).optional(),
})

export type MealPlanSettings = z.infer<typeof mealPlanSettingsSchema>

/**
 * Full meal matcher input combining profile and settings
 */
export const mealMatcherInputSchema = z.object({
  // From User Profile
  dietaryPreference: dietaryPreferenceSchema.default('omnivore'),
  allergies: z.array(allergySchema).default([]),
  goal: goalSchema.default('balanced'),
  cookingSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  dailyCalorieTarget: z.number().positive().default(2000),
  targetProtein: z.number().nonnegative().default(150),
  targetCarbs: z.number().nonnegative().default(200),
  targetFats: z.number().nonnegative().default(70),
  locale: localeSchema.default('en'),

  // From Meal Plan Settings
  settings: mealPlanSettingsSchema,
})

export type MealMatcherInput = z.infer<typeof mealMatcherInputSchema>

/**
 * Dietary tags for filtering seed meals
 */
export const dietaryTagSchema = z.enum([
  'vegetarian',
  'vegan',
  'gluten_free',
  'dairy_free',
  'halal',
  'low_carb',
  'high_protein',
  'nut_free',
  'egg_free',
  'shellfish_free',
])

export type DietaryTag = z.infer<typeof dietaryTagSchema>
