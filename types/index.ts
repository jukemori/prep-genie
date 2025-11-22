import type { Tables, TablesInsert, TablesUpdate } from './database'

// User Profile Types
export type UserProfile = Tables<'user_profiles'>
export type UserProfileInsert = TablesInsert<'user_profiles'>
export type UserProfileUpdate = TablesUpdate<'user_profiles'>

// Meal Types
export type Meal = Tables<'meals'>
export type MealInsert = TablesInsert<'meals'>
export type MealUpdate = TablesUpdate<'meals'>

// Meal Plan Types
export type MealPlan = Tables<'meal_plans'>
export type MealPlanInsert = TablesInsert<'meal_plans'>
export type MealPlanUpdate = TablesUpdate<'meal_plans'>

// Meal Plan Item Types
export type MealPlanItem = Tables<'meal_plan_items'>
export type MealPlanItemInsert = TablesInsert<'meal_plan_items'>
export type MealPlanItemUpdate = TablesUpdate<'meal_plan_items'>

// Grocery List Types
export type GroceryList = Tables<'grocery_lists'>
export type GroceryListInsert = TablesInsert<'grocery_lists'>
export type GroceryListUpdate = TablesUpdate<'grocery_lists'>

// Saved Meal Types
export type SavedMeal = Tables<'saved_meals'>
export type SavedMealInsert = TablesInsert<'saved_meals'>
export type SavedMealUpdate = TablesUpdate<'saved_meals'>

// Progress Log Types
export type ProgressLog = Tables<'progress_logs'>
export type ProgressLogInsert = TablesInsert<'progress_logs'>
export type ProgressLogUpdate = TablesUpdate<'progress_logs'>

// AI Chat History Types
export type AIChatHistory = Tables<'ai_chat_history'>
export type AIChatHistoryInsert = TablesInsert<'ai_chat_history'>
export type AIChatHistoryUpdate = TablesUpdate<'ai_chat_history'>

// Extended types for application use
export interface MealWithDetails extends Meal {
  total_calories?: number
  total_protein?: number
  total_carbs?: number
  total_fats?: number
}

export interface MealPlanWithItems extends MealPlan {
  meal_plan_items?: (MealPlanItem & { meals?: Meal })[]
}

// Nutrition calculation types
export type Gender = 'male' | 'female' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Goal = 'weight_loss' | 'maintain' | 'muscle_gain' | 'balanced'
export type DietaryPreference = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'halal'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type BudgetLevel = 'low' | 'medium' | 'high'
export type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced'
