import type { Tables } from '@/types/database'

export type UserProfile = Tables<'user_profiles'>
export type Meal = Tables<'meals'>
export type MealPlan = Tables<'meal_plans'>
export type GroceryList = Tables<'grocery_lists'>

export const mockUserProfile: UserProfile = {
  id: 'user-123',
  age: 30,
  weight: 80,
  height: 180,
  gender: 'male',
  activity_level: 'moderate',
  goal: 'muscle_gain',
  dietary_preference: 'omnivore',
  allergies: ['peanuts', 'shellfish'],
  budget_level: 'medium',
  cooking_skill_level: 'intermediate',
  time_available: 60,
  tdee: 2400,
  daily_calorie_target: 2600,
  target_protein: 180,
  target_carbs: 280,
  target_fats: 70,
  locale: 'en',
  unit_system: 'metric',
  currency: 'USD',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockMeal: Meal = {
  id: 'meal-123',
  user_id: 'user-123',
  name: 'Grilled Chicken Breast',
  description: 'High-protein meal',
  ingredients: [
    { name: 'Chicken breast', quantity: 200, unit: 'g' },
    { name: 'Olive oil', quantity: 1, unit: 'tbsp' },
    { name: 'Salt', quantity: 1, unit: 'tsp' },
    { name: 'Pepper', quantity: 0.5, unit: 'tsp' },
  ],
  instructions: [
    'Season chicken with salt and pepper',
    'Heat olive oil in a pan',
    'Grill chicken for 6-7 minutes per side',
    'Let rest for 5 minutes before serving',
  ],
  prep_time: 5,
  cook_time: 15,
  servings: 1,
  calories_per_serving: 300,
  protein_per_serving: 50,
  carbs_per_serving: 0,
  fats_per_serving: 10,
  tags: ['high-protein', 'low-carb', 'dinner'],
  cuisine_type: 'Western',
  meal_type: 'dinner',
  difficulty_level: 'easy',
  is_public: false,
  is_ai_generated: true,
  rating: null,
  image_url: null,
  storage_instructions: null,
  reheating_instructions: null,
  batch_cooking_multiplier: null,
  meal_prep_friendly: false,
  container_type: null,
  storage_duration_days: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockMealPlan: MealPlan = {
  id: 'plan-123',
  user_id: 'user-123',
  name: 'Weekly Meal Plan',
  start_date: '2025-11-25',
  end_date: '2025-12-01',
  type: 'weekly',
  total_calories: 2600,
  total_protein: 180,
  total_carbs: 280,
  total_fats: 70,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockGroceryList: GroceryList = {
  id: 'list-123',
  user_id: 'user-123',
  meal_plan_id: 'plan-123',
  name: 'Weekly Groceries',
  items: [
    {
      name: 'Chicken breast',
      quantity: 1400,
      unit: 'g',
      category: 'proteins',
      is_purchased: false,
    },
    {
      name: 'Olive oil',
      quantity: 1,
      unit: 'bottle',
      category: 'pantry',
      is_purchased: false,
    },
    {
      name: 'Broccoli',
      quantity: 500,
      unit: 'g',
      category: 'produce',
      is_purchased: false,
    },
  ],
  estimated_cost: 45.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
