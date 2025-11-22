import { z } from 'zod'

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  category: z
    .enum(['produce', 'protein', 'dairy', 'grains', 'pantry', 'spices', 'other'])
    .optional(),
})

export const mealSchema = z.object({
  name: z.string().min(1, 'Meal name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1)).min(1, 'At least one instruction is required'),
  prepTime: z.number().int().positive('Prep time must be positive').optional(),
  cookTime: z.number().int().positive('Cook time must be positive').optional(),
  servings: z.number().int().positive('Servings must be at least 1').default(1),
  caloriesPerServing: z.number().int().positive().optional(),
  proteinPerServing: z.number().int().nonnegative().optional(),
  carbsPerServing: z.number().int().nonnegative().optional(),
  fatsPerServing: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional().default([]),
  cuisineType: z.string().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isPublic: z.boolean().default(false),
  imageUrl: z.string().url().optional(),
})

export type MealForm = z.infer<typeof mealSchema>
export type Ingredient = z.infer<typeof ingredientSchema>

// Schema for editing macros only
export const macroEditSchema = z.object({
  caloriesPerServing: z.number().int().positive('Calories must be positive'),
  proteinPerServing: z.number().int().nonnegative('Protein cannot be negative'),
  carbsPerServing: z.number().int().nonnegative('Carbs cannot be negative'),
  fatsPerServing: z.number().int().nonnegative('Fats cannot be negative'),
  servings: z.number().int().positive('Servings must be at least 1'),
})

export type MacroEdit = z.infer<typeof macroEditSchema>
