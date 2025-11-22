import { z } from 'zod'

export const userProfileSchema = z.object({
  age: z.number().int().min(13, 'Must be at least 13 years old').max(120, 'Invalid age'),
  weight: z.number().positive('Weight must be positive'),
  height: z.number().positive('Height must be positive'),
  gender: z.enum(['male', 'female', 'other']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['weight_loss', 'maintain', 'muscle_gain', 'balanced']),
  dietaryPreference: z.enum(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'halal']),
  allergies: z.array(z.string()).optional().default([]),
  budgetLevel: z.enum(['low', 'medium', 'high']).optional(),
  cookingSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  timeAvailable: z.number().int().positive().optional(), // minutes per day
})

export type UserProfileForm = z.infer<typeof userProfileSchema>

export const onboardingStep1Schema = userProfileSchema.pick({
  age: true,
  weight: true,
  height: true,
  gender: true,
})

export const onboardingStep2Schema = userProfileSchema.pick({
  activityLevel: true,
  goal: true,
})

export const onboardingStep3Schema = userProfileSchema.pick({
  dietaryPreference: true,
  allergies: true,
})

export const onboardingStep4Schema = userProfileSchema.pick({
  budgetLevel: true,
  cookingSkillLevel: true,
  timeAvailable: true,
})
