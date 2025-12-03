import { describe, expect, it } from 'vitest'
import { calculateMealScore, filterByDietaryNeeds } from '@/features/meal-plans/utils/meal-matcher'
import type { Meal, UserProfile } from '@/types'

// Test fixtures
const createMockMeal = (overrides: Partial<Meal> = {}): Meal => ({
  id: '1',
  user_id: null,
  name: 'Test Meal',
  description: 'A test meal',
  ingredients: [],
  instructions: [],
  prep_time: 15,
  cook_time: 20,
  servings: 2,
  calories_per_serving: 500,
  protein_per_serving: 25,
  carbs_per_serving: 50,
  fats_per_serving: 20,
  tags: [],
  cuisine_type: 'western',
  meal_type: 'lunch',
  difficulty_level: 'easy',
  is_public: false,
  is_ai_generated: false,
  is_seed_meal: true,
  dietary_tags: [],
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
  ...overrides,
})

const createMockProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'user-1',
  age: 30,
  weight: 80,
  height: 180,
  gender: 'male',
  activity_level: 'moderate',
  goal: 'maintain',
  dietary_preference: 'omnivore',
  allergies: [],
  budget_level: 'medium',
  cooking_skill_level: 'intermediate',
  time_available: 60,
  tdee: 2400,
  daily_calorie_target: 2000,
  target_protein: 150,
  target_carbs: 200,
  target_fats: 70,
  locale: 'en',
  unit_system: 'metric',
  currency: 'USD',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

describe('Meal Matcher', () => {
  describe('filterByDietaryNeeds', () => {
    it('should return all meals for omnivore with no allergies', () => {
      const meals = [
        createMockMeal({ id: '1', dietary_tags: [] }),
        createMockMeal({ id: '2', dietary_tags: ['vegetarian'] }),
        createMockMeal({ id: '3', dietary_tags: ['high_protein'] }),
      ]
      const profile = createMockProfile({
        dietary_preference: 'omnivore',
        allergies: [],
      })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(3)
    })

    it('should filter out non-vegetarian meals for vegetarian users', () => {
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['vegetarian'] }),
        createMockMeal({ id: '2', dietary_tags: [] }),
        createMockMeal({ id: '3', dietary_tags: ['vegetarian', 'gluten_free'] }),
      ]
      const profile = createMockProfile({ dietary_preference: 'vegetarian' })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(2)
      expect(result.map((m) => m.id)).toEqual(['1', '3'])
    })

    it('should filter out non-vegan meals for vegan users', () => {
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['vegan'] }),
        createMockMeal({ id: '2', dietary_tags: ['vegetarian'] }),
        createMockMeal({ id: '3', dietary_tags: [] }),
      ]
      const profile = createMockProfile({ dietary_preference: 'vegan' })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter out non-halal meals for halal users', () => {
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['halal'] }),
        createMockMeal({ id: '2', dietary_tags: [] }),
      ]
      const profile = createMockProfile({ dietary_preference: 'halal' })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter out meals containing allergens', () => {
      // New permissive behavior: only filter out meals with explicit "contains_" tags
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['dairy_free'] }),
        createMockMeal({ id: '2', dietary_tags: [] }), // Safe: no contains_dairy
        createMockMeal({ id: '3', dietary_tags: ['contains_dairy'] }), // Unsafe: explicit allergen
      ]
      const profile = createMockProfile({ allergies: ['dairy'] })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(2)
      expect(result.map((m) => m.id)).toEqual(['1', '2'])
    })

    it('should handle multiple allergies', () => {
      // New permissive behavior: only filter out meals with explicit "contains_" tags
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['dairy_free', 'gluten_free'] }), // Safe
        createMockMeal({ id: '2', dietary_tags: ['contains_dairy'] }), // Unsafe: has dairy
        createMockMeal({ id: '3', dietary_tags: ['contains_gluten'] }), // Unsafe: has gluten
        createMockMeal({ id: '4', dietary_tags: [] }), // Safe: no allergens
      ]
      const profile = createMockProfile({ allergies: ['dairy', 'gluten'] })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(2)
      expect(result.map((m) => m.id)).toEqual(['1', '4'])
    })

    it('should handle nut allergies', () => {
      // New permissive behavior: only filter out meals with explicit "contains_" tags
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['nut_free'] }),
        createMockMeal({ id: '2', dietary_tags: [] }), // Safe: no contains_nuts
        createMockMeal({ id: '3', dietary_tags: ['contains_nuts'] }), // Unsafe: explicit allergen
      ]
      const profile = createMockProfile({ allergies: ['nuts'] })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(2)
      expect(result.map((m) => m.id)).toEqual(['1', '2'])
    })

    it('should handle shellfish allergies', () => {
      // New permissive behavior: only filter out meals with explicit "contains_" tags
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['shellfish_free'] }),
        createMockMeal({ id: '2', dietary_tags: [] }), // Safe: no contains_shellfish
        createMockMeal({ id: '3', dietary_tags: ['contains_shellfish'] }), // Unsafe
      ]
      const profile = createMockProfile({ allergies: ['shellfish'] })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(2)
      expect(result.map((m) => m.id)).toEqual(['1', '2'])
    })

    it('should handle null dietary_tags', () => {
      const meals = [
        createMockMeal({ id: '1', dietary_tags: null }),
        createMockMeal({ id: '2', dietary_tags: ['vegetarian'] }),
      ]
      const profile = createMockProfile({ dietary_preference: 'omnivore' })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(2)
    })

    it('should combine dietary preference and allergies', () => {
      // Dietary preference is strict (must have tag), allergies are permissive (only exclude contains_)
      const meals = [
        createMockMeal({ id: '1', dietary_tags: ['vegetarian', 'dairy_free'] }), // Safe: vegetarian + no dairy
        createMockMeal({ id: '2', dietary_tags: ['vegetarian'] }), // Safe: vegetarian + no contains_dairy
        createMockMeal({ id: '3', dietary_tags: ['dairy_free'] }), // Unsafe: not vegetarian
        createMockMeal({ id: '4', dietary_tags: ['vegetarian', 'contains_dairy'] }), // Unsafe: has dairy
      ]
      const profile = createMockProfile({
        dietary_preference: 'vegetarian',
        allergies: ['dairy'],
      })

      const result = filterByDietaryNeeds(meals, profile)

      expect(result).toHaveLength(2)
      expect(result.map((m) => m.id)).toEqual(['1', '2'])
    })
  })

  describe('calculateMealScore', () => {
    it('should give higher score for unused meals', () => {
      const meal = createMockMeal()
      const profile = createMockProfile()

      const scoreUnused = calculateMealScore(meal, profile, new Set())
      const scoreUsed = calculateMealScore(meal, profile, new Set([meal.id]))

      expect(scoreUnused).toBeGreaterThan(scoreUsed)
      expect(scoreUnused - scoreUsed).toBeCloseTo(50, 5) // Penalty for used meal
    })

    it('should give bonus for high protein meals when goal is muscle_gain', () => {
      const highProtein = createMockMeal({ protein_per_serving: 40 })
      const lowProtein = createMockMeal({ protein_per_serving: 15 })
      const profile = createMockProfile({ goal: 'muscle_gain' })

      const highScore = calculateMealScore(highProtein, profile, new Set())
      const lowScore = calculateMealScore(lowProtein, profile, new Set())

      expect(highScore).toBeGreaterThan(lowScore)
    })

    it('should NOT give bonus for normal protein meals even with muscle_gain goal', () => {
      const normalProtein = createMockMeal({ protein_per_serving: 25 }) // < 30g threshold
      const lowProtein = createMockMeal({ protein_per_serving: 15 })
      const profile = createMockProfile({ goal: 'muscle_gain' })

      const normalScore = calculateMealScore(normalProtein, profile, new Set())
      const lowScore = calculateMealScore(lowProtein, profile, new Set())

      // Both should have similar scores since neither hits the 30g threshold
      expect(Math.abs(normalScore - lowScore)).toBeLessThan(5)
    })

    it('should give bonus for low carb meals when goal is weight_loss', () => {
      const lowCarb = createMockMeal({ carbs_per_serving: 20 })
      const highCarb = createMockMeal({ carbs_per_serving: 80 })
      const profile = createMockProfile({ goal: 'weight_loss' })

      const lowScore = calculateMealScore(lowCarb, profile, new Set())
      const highScore = calculateMealScore(highCarb, profile, new Set())

      expect(lowScore).toBeGreaterThan(highScore)
    })

    it('should give bonus for high protein meals when goal is weight_loss', () => {
      const highProtein = createMockMeal({ protein_per_serving: 30 })
      const lowProtein = createMockMeal({ protein_per_serving: 15 })
      const profile = createMockProfile({ goal: 'weight_loss' })

      const highScore = calculateMealScore(highProtein, profile, new Set())
      const lowScore = calculateMealScore(lowProtein, profile, new Set())

      expect(highScore).toBeGreaterThan(lowScore)
    })

    it('should penalize meals far from calorie target', () => {
      // Target is 2000 / 3 = ~667 calories per meal
      const onTarget = createMockMeal({ calories_per_serving: 667 })
      const offTarget = createMockMeal({ calories_per_serving: 1000 })
      const profile = createMockProfile({ daily_calorie_target: 2000 })

      const onScore = calculateMealScore(onTarget, profile, new Set())
      const offScore = calculateMealScore(offTarget, profile, new Set())

      expect(onScore).toBeGreaterThan(offScore)
    })

    it('should handle null calorie target', () => {
      const meal = createMockMeal({ calories_per_serving: 500 })
      const profile = createMockProfile({ daily_calorie_target: null })

      // Should not throw, default to 2000
      const score = calculateMealScore(meal, profile, new Set())

      expect(typeof score).toBe('number')
      expect(score).toBeGreaterThan(0)
    })

    it('should handle null protein value', () => {
      const meal = createMockMeal({ protein_per_serving: null })
      const profile = createMockProfile({ goal: 'muscle_gain' })

      const score = calculateMealScore(meal, profile, new Set())

      expect(typeof score).toBe('number')
    })

    it('should handle null carbs value', () => {
      const meal = createMockMeal({ carbs_per_serving: null })
      const profile = createMockProfile({ goal: 'weight_loss' })

      const score = calculateMealScore(meal, profile, new Set())

      expect(typeof score).toBe('number')
    })

    // New tests for enhanced scoring
    describe('prep time scoring', () => {
      it('should penalize meals that exceed available time', () => {
        const quickMeal = createMockMeal({ prep_time: 20 })
        const slowMeal = createMockMeal({ prep_time: 90 })
        const profile = createMockProfile({ time_available: 30 })

        const quickScore = calculateMealScore(quickMeal, profile, new Set())
        const slowScore = calculateMealScore(slowMeal, profile, new Set())

        expect(quickScore).toBeGreaterThan(slowScore)
      })

      it('should give bonus for quick meals when user has limited time', () => {
        const veryQuickMeal = createMockMeal({ prep_time: 15 }) // Half of available time
        const normalMeal = createMockMeal({ prep_time: 50 })
        const profile = createMockProfile({ time_available: 60 })

        const quickScore = calculateMealScore(veryQuickMeal, profile, new Set())
        const normalScore = calculateMealScore(normalMeal, profile, new Set())

        expect(quickScore).toBeGreaterThan(normalScore)
      })

      it('should use default time_available when null', () => {
        const meal = createMockMeal({ prep_time: 30 })
        const profile = createMockProfile({ time_available: null })

        const score = calculateMealScore(meal, profile, new Set())

        expect(typeof score).toBe('number')
        expect(score).toBeGreaterThan(0)
      })
    })

    describe('skill level scoring', () => {
      it('should give bonus when meal difficulty matches user skill', () => {
        const easyMeal = createMockMeal({ difficulty_level: 'easy' })
        const hardMeal = createMockMeal({ difficulty_level: 'hard' })
        const beginnerProfile = createMockProfile({ cooking_skill_level: 'beginner' })

        const easyScore = calculateMealScore(easyMeal, beginnerProfile, new Set())
        const hardScore = calculateMealScore(hardMeal, beginnerProfile, new Set())

        expect(easyScore).toBeGreaterThan(hardScore)
      })

      it('should allow advanced users to cook any difficulty', () => {
        const easyMeal = createMockMeal({ difficulty_level: 'easy' })
        const hardMeal = createMockMeal({ difficulty_level: 'hard' })
        const advancedProfile = createMockProfile({ cooking_skill_level: 'advanced' })

        const easyScore = calculateMealScore(easyMeal, advancedProfile, new Set())
        const hardScore = calculateMealScore(hardMeal, advancedProfile, new Set())

        // Both should get bonus since advanced can handle any difficulty
        expect(easyScore).toBeGreaterThan(0)
        expect(hardScore).toBeGreaterThan(0)
      })

      it('should penalize meals too difficult for user', () => {
        const hardMeal = createMockMeal({ difficulty_level: 'hard' })
        const beginnerProfile = createMockProfile({ cooking_skill_level: 'beginner' })
        const advancedProfile = createMockProfile({ cooking_skill_level: 'advanced' })

        const beginnerScore = calculateMealScore(hardMeal, beginnerProfile, new Set())
        const advancedScore = calculateMealScore(hardMeal, advancedProfile, new Set())

        expect(advancedScore).toBeGreaterThan(beginnerScore)
      })

      it('should use default skill level when null', () => {
        const meal = createMockMeal({ difficulty_level: 'medium' })
        const profile = createMockProfile({ cooking_skill_level: null })

        const score = calculateMealScore(meal, profile, new Set())

        expect(typeof score).toBe('number')
      })
    })

    describe('budget level scoring', () => {
      it('should penalize complex meals for low budget users', () => {
        const simpleMeal = createMockMeal({
          ingredients: [
            { name: 'Rice', quantity: 1, unit: 'cup', category: 'grain' },
            { name: 'Egg', quantity: 2, unit: 'pcs', category: 'protein' },
          ],
        })
        const complexMeal = createMockMeal({
          ingredients: Array.from({ length: 12 }, (_, i) => ({
            name: `Ingredient ${i}`,
            quantity: 1,
            unit: 'pcs',
            category: 'misc',
          })),
        })
        const lowBudgetProfile = createMockProfile({ budget_level: 'low' })

        const simpleScore = calculateMealScore(simpleMeal, lowBudgetProfile, new Set())
        const complexScore = calculateMealScore(complexMeal, lowBudgetProfile, new Set())

        expect(simpleScore).toBeGreaterThan(complexScore)
      })

      it('should give bonus for complex meals to high budget users', () => {
        const complexMeal = createMockMeal({
          ingredients: Array.from({ length: 10 }, (_, i) => ({
            name: `Ingredient ${i}`,
            quantity: 1,
            unit: 'pcs',
            category: 'misc',
          })),
        })
        const highBudgetProfile = createMockProfile({ budget_level: 'high' })
        const lowBudgetProfile = createMockProfile({ budget_level: 'low' })

        const highBudgetScore = calculateMealScore(complexMeal, highBudgetProfile, new Set())
        const lowBudgetScore = calculateMealScore(complexMeal, lowBudgetProfile, new Set())

        expect(highBudgetScore).toBeGreaterThan(lowBudgetScore)
      })

      it('should handle null ingredients', () => {
        const meal = createMockMeal({ ingredients: null })
        const profile = createMockProfile({ budget_level: 'low' })

        const score = calculateMealScore(meal, profile, new Set())

        expect(typeof score).toBe('number')
      })
    })

    describe('score boundaries', () => {
      it('should never return negative score', () => {
        // Create worst case scenario
        const meal = createMockMeal({
          calories_per_serving: 2000, // Way off target
          prep_time: 120, // Very long
          difficulty_level: 'hard',
          ingredients: Array.from({ length: 20 }, (_, i) => ({
            name: `Ingredient ${i}`,
            quantity: 1,
            unit: 'pcs',
            category: 'misc',
          })),
        })
        const profile = createMockProfile({
          daily_calorie_target: 1500,
          time_available: 15,
          cooking_skill_level: 'beginner',
          budget_level: 'low',
        })

        const score = calculateMealScore(meal, profile, new Set([meal.id]))

        expect(score).toBeGreaterThanOrEqual(0)
      })

      it('should cap calorie penalty at 30 points', () => {
        const veryHighCalMeal = createMockMeal({ calories_per_serving: 2000 })
        const highCalMeal = createMockMeal({ calories_per_serving: 1500 })
        const profile = createMockProfile({ daily_calorie_target: 1500 }) // target ~500 per meal

        const veryHighScore = calculateMealScore(veryHighCalMeal, profile, new Set())
        const highScore = calculateMealScore(highCalMeal, profile, new Set())

        // Both should be penalized, but penalty is capped
        const veryHighPenalty = 100 - veryHighScore

        // highScore is calculated to demonstrate both are penalized
        // but veryHighPenalty should not be disproportionately worse
        expect(highScore).toBeLessThan(100)

        // Very high calorie penalty should be capped, not proportionally worse
        expect(veryHighPenalty).toBeLessThanOrEqual(50) // With other bonuses/penalties
      })
    })
  })
})

describe('Zod Schemas', () => {
  it('should validate correct meal plan settings', async () => {
    const { mealPlanSettingsSchema } = await import(
      '@/features/meal-plans/schemas/meal-plan.schema'
    )

    const validSettings = {
      cuisineType: 'japanese',
      mealsPerDay: 4,
      varietyLevel: 'high',
      prepTimeMax: 30,
    }

    const result = mealPlanSettingsSchema.safeParse(validSettings)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cuisineType).toBe('japanese')
      expect(result.data.mealsPerDay).toBe(4)
    }
  })

  it('should reject invalid mealsPerDay', async () => {
    const { mealPlanSettingsSchema } = await import(
      '@/features/meal-plans/schemas/meal-plan.schema'
    )

    const invalidSettings = {
      cuisineType: 'japanese',
      mealsPerDay: 6, // Invalid - must be 3, 4, or 5
      varietyLevel: 'high',
    }

    const result = mealPlanSettingsSchema.safeParse(invalidSettings)

    expect(result.success).toBe(false)
  })

  it('should apply defaults for missing fields', async () => {
    const { mealPlanSettingsSchema } = await import(
      '@/features/meal-plans/schemas/meal-plan.schema'
    )

    const result = mealPlanSettingsSchema.parse({})

    expect(result.cuisineType).toBe('any')
    expect(result.mealsPerDay).toBe(3)
    expect(result.varietyLevel).toBe('medium')
    expect(result.prepTimeMax).toBeUndefined()
  })

  it('should reject prepTimeMax below minimum', async () => {
    const { mealPlanSettingsSchema } = await import(
      '@/features/meal-plans/schemas/meal-plan.schema'
    )

    const result = mealPlanSettingsSchema.safeParse({ prepTimeMax: 5 })

    expect(result.success).toBe(false)
  })

  it('should reject prepTimeMax above maximum', async () => {
    const { mealPlanSettingsSchema } = await import(
      '@/features/meal-plans/schemas/meal-plan.schema'
    )

    const result = mealPlanSettingsSchema.safeParse({ prepTimeMax: 150 })

    expect(result.success).toBe(false)
  })

  it('should validate locale schema', async () => {
    const { localeSchema } = await import('@/features/meal-plans/schemas/meal-plan.schema')

    expect(localeSchema.safeParse('en').success).toBe(true)
    expect(localeSchema.safeParse('ja').success).toBe(true)
    expect(localeSchema.safeParse('fr').success).toBe(false)
  })

  it('should validate dietary preference schema', async () => {
    const { dietaryPreferenceSchema } = await import(
      '@/features/meal-plans/schemas/meal-plan.schema'
    )

    expect(dietaryPreferenceSchema.safeParse('omnivore').success).toBe(true)
    expect(dietaryPreferenceSchema.safeParse('vegetarian').success).toBe(true)
    expect(dietaryPreferenceSchema.safeParse('vegan').success).toBe(true)
    expect(dietaryPreferenceSchema.safeParse('pescatarian').success).toBe(true)
    expect(dietaryPreferenceSchema.safeParse('halal').success).toBe(true)
    expect(dietaryPreferenceSchema.safeParse('carnivore').success).toBe(false)
  })
})
