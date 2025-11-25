import { describe, expect, it } from 'vitest'
import { ingredientSchema, macroEditSchema, mealSchema } from '@/features/meals/schemas/meal.schema'

describe('Meal Schema Validation', () => {
  describe('ingredientSchema', () => {
    it('validates valid ingredient', () => {
      const ingredient = {
        name: 'Chicken breast',
        quantity: 200,
        unit: 'g',
        category: 'protein' as const,
      }

      const result = ingredientSchema.safeParse(ingredient)

      expect(result.success).toBe(true)
    })

    it('rejects ingredient with empty name', () => {
      const ingredient = {
        name: '',
        quantity: 200,
        unit: 'g',
      }

      const result = ingredientSchema.safeParse(ingredient)

      expect(result.success).toBe(false)
    })

    it('rejects ingredient with negative quantity', () => {
      const ingredient = {
        name: 'Salt',
        quantity: -1,
        unit: 'tsp',
      }

      const result = ingredientSchema.safeParse(ingredient)

      expect(result.success).toBe(false)
    })

    it('rejects ingredient with empty unit', () => {
      const ingredient = {
        name: 'Chicken',
        quantity: 200,
        unit: '',
      }

      const result = ingredientSchema.safeParse(ingredient)

      expect(result.success).toBe(false)
    })

    it('accepts ingredient without category', () => {
      const ingredient = {
        name: 'Chicken',
        quantity: 200,
        unit: 'g',
      }

      const result = ingredientSchema.safeParse(ingredient)

      expect(result.success).toBe(true)
    })

    it('accepts all valid categories', () => {
      const categories = [
        'produce',
        'protein',
        'dairy',
        'grains',
        'pantry',
        'spices',
        'other',
      ] as const

      for (const category of categories) {
        const ingredient = {
          name: 'Test',
          quantity: 100,
          unit: 'g',
          category,
        }

        const result = ingredientSchema.safeParse(ingredient)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('mealSchema', () => {
    const validMeal = {
      name: 'Grilled Chicken',
      description: 'Healthy high-protein meal',
      ingredients: [
        { name: 'Chicken breast', quantity: 200, unit: 'g', category: 'protein' as const },
        { name: 'Olive oil', quantity: 1, unit: 'tbsp', category: 'pantry' as const },
      ],
      instructions: ['Season chicken', 'Grill for 15 minutes', 'Let rest'],
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      caloriesPerServing: 300,
      proteinPerServing: 50,
      carbsPerServing: 5,
      fatsPerServing: 10,
      tags: ['high-protein', 'low-carb'],
      cuisineType: 'Western',
      mealType: 'dinner' as const,
      difficultyLevel: 'easy' as const,
      isPublic: false,
    }

    it('validates complete valid meal', () => {
      const result = mealSchema.safeParse(validMeal)

      expect(result.success).toBe(true)
    })

    it('validates minimal meal (required fields only)', () => {
      const minimalMeal = {
        name: 'Quick Meal',
        ingredients: [{ name: 'Egg', quantity: 2, unit: 'whole' }],
        instructions: ['Cook it'],
      }

      const result = mealSchema.safeParse(minimalMeal)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.servings).toBe(1) // default
        expect(result.data.tags).toEqual([]) // default
        expect(result.data.isPublic).toBe(false) // default
      }
    })

    it('rejects meal with empty name', () => {
      const meal = { ...validMeal, name: '' }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('rejects meal with name over 100 characters', () => {
      const meal = { ...validMeal, name: 'a'.repeat(101) }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('rejects meal with description over 500 characters', () => {
      const meal = { ...validMeal, description: 'a'.repeat(501) }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('accepts meal with optional description omitted', () => {
      const meal = {
        name: 'Quick Meal',
        ingredients: [{ name: 'Egg', quantity: 2, unit: 'whole' }],
        instructions: ['Cook it'],
      }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(true)
    })

    it('rejects meal with empty ingredients array', () => {
      const meal = {
        name: 'No Ingredients Meal',
        ingredients: [],
        instructions: ['Do nothing'],
      }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('rejects meal with empty instructions array', () => {
      const meal = {
        name: 'No Instructions Meal',
        ingredients: [{ name: 'Egg', quantity: 2, unit: 'whole' }],
        instructions: [],
      }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('rejects meal with empty instruction string', () => {
      const meal = {
        name: 'Empty Instruction',
        ingredients: [{ name: 'Egg', quantity: 2, unit: 'whole' }],
        instructions: ['Cook it', ''],
      }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('rejects meal with negative prepTime', () => {
      const meal = { ...validMeal, prepTime: -10 }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('rejects meal with negative cookTime', () => {
      const meal = { ...validMeal, cookTime: -15 }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('rejects meal with servings less than 1', () => {
      const meal = { ...validMeal, servings: 0 }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('rejects meal with negative calories', () => {
      const meal = { ...validMeal, caloriesPerServing: -100 }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('rejects meal with negative protein', () => {
      const meal = { ...validMeal, proteinPerServing: -50 }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('accepts meal with zero carbs (low-carb meal)', () => {
      const meal = { ...validMeal, carbsPerServing: 0 }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(true)
    })

    it('accepts meal with zero fats (low-fat meal)', () => {
      const meal = { ...validMeal, fatsPerServing: 0 }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(true)
    })

    it('accepts all valid meal types', () => {
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const

      for (const mealType of mealTypes) {
        const meal = { ...validMeal, mealType }

        const result = mealSchema.safeParse(meal)
        expect(result.success).toBe(true)
      }
    })

    it('accepts all valid difficulty levels', () => {
      const difficulties = ['easy', 'medium', 'hard'] as const

      for (const difficultyLevel of difficulties) {
        const meal = { ...validMeal, difficultyLevel }

        const result = mealSchema.safeParse(meal)
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid meal type', () => {
      const meal = { ...validMeal, mealType: 'invalid' }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('accepts valid image URL', () => {
      const meal = { ...validMeal, imageUrl: 'https://example.com/image.jpg' }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(true)
    })

    it('rejects invalid image URL', () => {
      const meal = { ...validMeal, imageUrl: 'not-a-url' }

      const result = mealSchema.safeParse(meal)

      expect(result.success).toBe(false)
    })

    it('sets default values correctly', () => {
      const minimalMeal = {
        name: 'Test',
        ingredients: [{ name: 'Egg', quantity: 1, unit: 'whole' }],
        instructions: ['Cook'],
      }

      const result = mealSchema.safeParse(minimalMeal)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.servings).toBe(1)
        expect(result.data.tags).toEqual([])
        expect(result.data.isPublic).toBe(false)
      }
    })
  })

  describe('macroEditSchema', () => {
    it('validates valid macro edit', () => {
      const macros = {
        caloriesPerServing: 500,
        proteinPerServing: 40,
        carbsPerServing: 50,
        fatsPerServing: 15,
        servings: 2,
      }

      const result = macroEditSchema.safeParse(macros)

      expect(result.success).toBe(true)
    })

    it('rejects negative calories', () => {
      const macros = {
        caloriesPerServing: -500,
        proteinPerServing: 40,
        carbsPerServing: 50,
        fatsPerServing: 15,
        servings: 2,
      }

      const result = macroEditSchema.safeParse(macros)

      expect(result.success).toBe(false)
    })

    it('rejects negative protein', () => {
      const macros = {
        caloriesPerServing: 500,
        proteinPerServing: -40,
        carbsPerServing: 50,
        fatsPerServing: 15,
        servings: 2,
      }

      const result = macroEditSchema.safeParse(macros)

      expect(result.success).toBe(false)
    })

    it('accepts zero carbs (keto meal)', () => {
      const macros = {
        caloriesPerServing: 500,
        proteinPerServing: 40,
        carbsPerServing: 0,
        fatsPerServing: 35,
        servings: 1,
      }

      const result = macroEditSchema.safeParse(macros)

      expect(result.success).toBe(true)
    })

    it('rejects servings less than 1', () => {
      const macros = {
        caloriesPerServing: 500,
        proteinPerServing: 40,
        carbsPerServing: 50,
        fatsPerServing: 15,
        servings: 0,
      }

      const result = macroEditSchema.safeParse(macros)

      expect(result.success).toBe(false)
    })
  })
})
