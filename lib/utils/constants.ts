/**
 * Application-wide constants for PrepGenie
 */

// Activity level multipliers for TDEE calculation
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // Little or no exercise
  light: 1.375, // Light exercise 1-3 days/week
  moderate: 1.55, // Moderate exercise 3-5 days/week
  active: 1.725, // Heavy exercise 6-7 days/week
  very_active: 1.9, // Very heavy exercise, physical job
} as const

// Goal-based calorie adjustments (percentage of TDEE)
export const GOAL_ADJUSTMENTS = {
  weight_loss: -0.2, // 20% deficit
  maintain: 0, // No adjustment
  muscle_gain: 0.1, // 10% surplus
  balanced: 0, // No adjustment
} as const

// Default macro ratios (as percentage of total calories)
export const DEFAULT_MACRO_RATIOS = {
  weight_loss: {
    protein: 0.35, // 35% protein
    carbs: 0.35, // 35% carbs
    fats: 0.3, // 30% fats
  },
  maintain: {
    protein: 0.3,
    carbs: 0.4,
    fats: 0.3,
  },
  muscle_gain: {
    protein: 0.3,
    carbs: 0.45,
    fats: 0.25,
  },
  balanced: {
    protein: 0.3,
    carbs: 0.4,
    fats: 0.3,
  },
} as const

// Calories per gram of macronutrient
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
  alcohol: 7,
} as const

// Meal type options
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

// Dietary preferences
export const DIETARY_PREFERENCES = [
  'omnivore',
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal',
] as const

// Difficulty levels
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const

// Activity levels
export const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'] as const

// Goals
export const GOALS = ['weight_loss', 'maintain', 'muscle_gain', 'balanced'] as const

// Budget levels
export const BUDGET_LEVELS = ['low', 'medium', 'high'] as const

// Cooking skill levels
export const COOKING_SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const

// Gender options
export const GENDERS = ['male', 'female', 'other'] as const

// Common grocery categories
export const GROCERY_CATEGORIES = [
  'produce',
  'protein',
  'dairy',
  'grains',
  'pantry',
  'frozen',
  'beverages',
  'snacks',
  'other',
] as const

// API limits
export const API_LIMITS = {
  FREE_MEAL_PLANS_PER_MONTH: 3,
  FREE_SAVED_MEALS: 10,
  PRO_UNLIMITED: -1,
} as const

// Validation constraints
export const VALIDATION_LIMITS = {
  MIN_AGE: 13,
  MAX_AGE: 120,
  MIN_WEIGHT_KG: 30,
  MAX_WEIGHT_KG: 300,
  MIN_HEIGHT_CM: 100,
  MAX_HEIGHT_CM: 250,
  MIN_PREP_TIME: 5,
  MAX_PREP_TIME: 480, // 8 hours
  MIN_SERVINGS: 1,
  MAX_SERVINGS: 20,
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  SHORT: 'MM/dd/yyyy',
  ISO: 'yyyy-MM-dd',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
} as const
