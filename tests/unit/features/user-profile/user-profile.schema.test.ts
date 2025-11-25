import { describe, it, expect } from 'vitest'
import {
  userProfileSchema,
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
} from '@/features/user-profile/schemas/user-profile.schema'

describe('User Profile Schema Validation', () => {
  describe('userProfileSchema', () => {
    it('validates complete valid profile', () => {
      const validProfile = {
        age: 30,
        weight: 80,
        height: 180,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'muscle_gain' as const,
        dietaryPreference: 'omnivore' as const,
        allergies: ['peanuts', 'shellfish'],
        budgetLevel: 'medium' as const,
        cookingSkillLevel: 'intermediate' as const,
        timeAvailable: 60,
      }

      const result = userProfileSchema.safeParse(validProfile)

      expect(result.success).toBe(true)
    })

    it('validates profile with optional fields omitted', () => {
      const validProfile = {
        age: 25,
        weight: 70,
        height: 175,
        gender: 'female' as const,
        activityLevel: 'light' as const,
        goal: 'weight_loss' as const,
        dietaryPreference: 'vegetarian' as const,
      }

      const result = userProfileSchema.safeParse(validProfile)

      expect(result.success).toBe(true)
    })

    it('sets default empty array for allergies', () => {
      const profile = {
        age: 30,
        weight: 80,
        height: 180,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.allergies).toEqual([])
      }
    })

    it('rejects age below minimum (13)', () => {
      const profile = {
        age: 12,
        weight: 70,
        height: 175,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 13')
      }
    })

    it('rejects age above maximum (120)', () => {
      const profile = {
        age: 121,
        weight: 70,
        height: 175,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid age')
      }
    })

    it('rejects negative weight', () => {
      const profile = {
        age: 30,
        weight: -70,
        height: 175,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(false)
    })

    it('rejects zero weight', () => {
      const profile = {
        age: 30,
        weight: 0,
        height: 175,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(false)
    })

    it('rejects negative height', () => {
      const profile = {
        age: 30,
        weight: 70,
        height: -175,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(false)
    })

    it('rejects invalid gender', () => {
      const profile = {
        age: 30,
        weight: 70,
        height: 175,
        gender: 'invalid',
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(false)
    })

    it('accepts all valid gender values', () => {
      const genders = ['male', 'female', 'other'] as const

      for (const gender of genders) {
        const profile = {
          age: 30,
          weight: 70,
          height: 175,
          gender,
          activityLevel: 'moderate' as const,
          goal: 'maintain' as const,
          dietaryPreference: 'omnivore' as const,
        }

        const result = userProfileSchema.safeParse(profile)
        expect(result.success).toBe(true)
      }
    })

    it('accepts all valid activity levels', () => {
      const activityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'] as const

      for (const activityLevel of activityLevels) {
        const profile = {
          age: 30,
          weight: 70,
          height: 175,
          gender: 'male' as const,
          activityLevel,
          goal: 'maintain' as const,
          dietaryPreference: 'omnivore' as const,
        }

        const result = userProfileSchema.safeParse(profile)
        expect(result.success).toBe(true)
      }
    })

    it('accepts all valid goals', () => {
      const goals = ['weight_loss', 'maintain', 'muscle_gain', 'balanced'] as const

      for (const goal of goals) {
        const profile = {
          age: 30,
          weight: 70,
          height: 175,
          gender: 'male' as const,
          activityLevel: 'moderate' as const,
          goal,
          dietaryPreference: 'omnivore' as const,
        }

        const result = userProfileSchema.safeParse(profile)
        expect(result.success).toBe(true)
      }
    })

    it('accepts all valid dietary preferences', () => {
      const preferences = ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'halal'] as const

      for (const dietaryPreference of preferences) {
        const profile = {
          age: 30,
          weight: 70,
          height: 175,
          gender: 'male' as const,
          activityLevel: 'moderate' as const,
          goal: 'maintain' as const,
          dietaryPreference,
        }

        const result = userProfileSchema.safeParse(profile)
        expect(result.success).toBe(true)
      }
    })

    it('accepts allergies as array of strings', () => {
      const profile = {
        age: 30,
        weight: 70,
        height: 175,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
        allergies: ['peanuts', 'tree nuts', 'dairy', 'gluten'],
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(true)
    })

    it('accepts empty allergies array', () => {
      const profile = {
        age: 30,
        weight: 70,
        height: 175,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
        allergies: [],
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(true)
    })

    it('accepts all valid budget levels', () => {
      const budgetLevels = ['low', 'medium', 'high'] as const

      for (const budgetLevel of budgetLevels) {
        const profile = {
          age: 30,
          weight: 70,
          height: 175,
          gender: 'male' as const,
          activityLevel: 'moderate' as const,
          goal: 'maintain' as const,
          dietaryPreference: 'omnivore' as const,
          budgetLevel,
        }

        const result = userProfileSchema.safeParse(profile)
        expect(result.success).toBe(true)
      }
    })

    it('accepts all valid cooking skill levels', () => {
      const skillLevels = ['beginner', 'intermediate', 'advanced'] as const

      for (const cookingSkillLevel of skillLevels) {
        const profile = {
          age: 30,
          weight: 70,
          height: 175,
          gender: 'male' as const,
          activityLevel: 'moderate' as const,
          goal: 'maintain' as const,
          dietaryPreference: 'omnivore' as const,
          cookingSkillLevel,
        }

        const result = userProfileSchema.safeParse(profile)
        expect(result.success).toBe(true)
      }
    })

    it('accepts positive timeAvailable in minutes', () => {
      const profile = {
        age: 30,
        weight: 70,
        height: 175,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
        timeAvailable: 120,
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(true)
    })

    it('rejects negative timeAvailable', () => {
      const profile = {
        age: 30,
        weight: 70,
        height: 175,
        gender: 'male' as const,
        activityLevel: 'moderate' as const,
        goal: 'maintain' as const,
        dietaryPreference: 'omnivore' as const,
        timeAvailable: -30,
      }

      const result = userProfileSchema.safeParse(profile)

      expect(result.success).toBe(false)
    })
  })

  describe('onboardingStep1Schema', () => {
    it('validates step 1 with required fields', () => {
      const step1 = {
        age: 30,
        weight: 80,
        height: 180,
        gender: 'male' as const,
      }

      const result = onboardingStep1Schema.safeParse(step1)

      expect(result.success).toBe(true)
    })

    it('rejects step 1 with missing fields', () => {
      const step1 = {
        age: 30,
        weight: 80,
        // missing height and gender
      }

      const result = onboardingStep1Schema.safeParse(step1)

      expect(result.success).toBe(false)
    })
  })

  describe('onboardingStep2Schema', () => {
    it('validates step 2 with required fields', () => {
      const step2 = {
        activityLevel: 'moderate' as const,
        goal: 'muscle_gain' as const,
      }

      const result = onboardingStep2Schema.safeParse(step2)

      expect(result.success).toBe(true)
    })
  })

  describe('onboardingStep3Schema', () => {
    it('validates step 3 with required fields', () => {
      const step3 = {
        dietaryPreference: 'omnivore' as const,
        allergies: ['peanuts'],
      }

      const result = onboardingStep3Schema.safeParse(step3)

      expect(result.success).toBe(true)
    })
  })

  describe('onboardingStep4Schema', () => {
    it('validates step 4 with all optional fields', () => {
      const step4 = {
        budgetLevel: 'medium' as const,
        cookingSkillLevel: 'intermediate' as const,
        timeAvailable: 60,
      }

      const result = onboardingStep4Schema.safeParse(step4)

      expect(result.success).toBe(true)
    })

    it('validates step 4 with no fields (all optional)', () => {
      const step4 = {}

      const result = onboardingStep4Schema.safeParse(step4)

      expect(result.success).toBe(true)
    })
  })
})
