import { createClient } from '@/lib/supabase/server'
import type { Meal, UserProfile } from '@/types'
import type { MealPlanSettings } from '../schemas/meal-plan.schema'

// ============================================
// Types
// ============================================

export interface MealMatcherInput {
  profile: UserProfile
  settings: MealPlanSettings
}

export interface DayMeals {
  day: number
  meals: Meal[]
}

export interface WeeklyMealPlan {
  days: DayMeals[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFats: number
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get skill levels that user can handle based on their skill level
 */
function getSkillLevels(skill: string | null): string[] {
  switch (skill) {
    case 'beginner':
      return ['easy']
    case 'intermediate':
      return ['easy', 'medium']
    case 'advanced':
      return ['easy', 'medium', 'hard']
    default:
      return ['easy', 'medium']
  }
}

/**
 * Filter meals by dietary needs (preference and allergies)
 *
 * For dietary preferences (vegetarian, vegan, halal), meals MUST have the tag.
 * For allergies, we use two strategies:
 *   1. If meal has "_free" tag (e.g., "dairy_free"), it's safe
 *   2. If meal has "contains_" tag (e.g., "contains_dairy"), it's NOT safe
 *   3. If meal has neither, we assume it's safe (permissive approach for seed data)
 */
export function filterByDietaryNeeds(meals: Meal[], profile: UserProfile): Meal[] {
  return meals.filter((meal) => {
    const tags = (meal.dietary_tags as string[] | null) || []

    // Check dietary preference - meals MUST have the matching tag
    if (profile.dietary_preference === 'vegetarian' && !tags.includes('vegetarian')) {
      return false
    }
    if (profile.dietary_preference === 'vegan' && !tags.includes('vegan')) {
      return false
    }
    if (profile.dietary_preference === 'halal' && !tags.includes('halal')) {
      return false
    }

    // Check allergies - exclude meals that explicitly contain allergens
    // We're permissive: if no "contains_" tag, assume safe
    const allergies = profile.allergies || []
    for (const allergy of allergies) {
      const containsTag = `contains_${allergy}`
      if (tags.includes(containsTag)) {
        return false
      }
    }

    return true
  })
}

/**
 * Group meals by meal type
 */
function groupByMealType(meals: Meal[]): Record<string, Meal[]> {
  return meals.reduce(
    (acc, meal) => {
      const type = meal.meal_type || 'other'
      if (!acc[type]) acc[type] = []
      acc[type].push(meal)
      return acc
    },
    {} as Record<string, Meal[]>
  )
}

/**
 * Calculate meal score based on profile goals and preferences
 */
export function calculateMealScore(meal: Meal, profile: UserProfile, usedIds: Set<string>): number {
  let score = 100

  // Heavy penalty for already used meals this week (variety is key)
  if (usedIds.has(meal.id)) {
    score -= 50
  }

  // Score based on calorie alignment (target is daily / 3 for main meals)
  const targetCals = (profile.daily_calorie_target || 2000) / 3
  const calDiff = Math.abs((meal.calories_per_serving || 0) - targetCals)
  score -= Math.min(calDiff / 10, 30) // Cap penalty at 30 points

  // Bonus for high protein if muscle gain goal
  if (profile.goal === 'muscle_gain' && (meal.protein_per_serving || 0) > 30) {
    score += 20
  }

  // Bonus for low carb if weight loss goal
  if (profile.goal === 'weight_loss' && (meal.carbs_per_serving || 0) < 30) {
    score += 15
  }

  // Bonus for high protein if weight loss goal
  if (profile.goal === 'weight_loss' && (meal.protein_per_serving || 0) > 25) {
    score += 10
  }

  // Prep time preference - penalize if meal takes longer than user's available time
  const timeAvailable = profile.time_available || 60
  const mealPrepTime = meal.prep_time ?? 30
  if (mealPrepTime > timeAvailable) {
    score -= 20
  } else if (mealPrepTime <= timeAvailable / 2) {
    // Bonus for quick meals when user has limited time
    score += 5
  }

  // Skill level matching
  const skillLevels: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }
  const userSkill = skillLevels[profile.cooking_skill_level ?? 'intermediate'] || 2
  const mealDifficulty: Record<string, number> = { easy: 1, medium: 2, hard: 3 }
  const difficulty = mealDifficulty[meal.difficulty_level ?? 'medium'] || 2

  if (difficulty <= userSkill) {
    score += 10
  } else {
    score -= 15 // Penalize meals too difficult for user
  }

  // Budget matching - more ingredients generally means higher cost
  const ingredients = meal.ingredients as Array<{ name: string }> | null
  const ingredientCount = ingredients?.length ?? 5
  if (profile.budget_level === 'low' && ingredientCount > 10) {
    score -= 10
  } else if (profile.budget_level === 'high' && ingredientCount > 8) {
    // High budget users might prefer more complex meals
    score += 5
  }

  return Math.max(score, 0) // Ensure score is never negative
}

/**
 * Select the best meal from a pool based on scoring
 */
function selectBestMeal(
  pool: Meal[],
  profile: UserProfile,
  usedIds: Set<string>,
  varietyLevel: 'low' | 'medium' | 'high'
): Meal | null {
  if (pool.length === 0) {
    return null
  }

  // Score each meal
  const scored = pool.map((meal) => ({
    meal,
    score: calculateMealScore(meal, profile, usedIds),
  }))

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Select based on variety level
  let selectedIndex = 0
  if (varietyLevel === 'high') {
    selectedIndex = Math.floor(Math.random() * Math.min(5, scored.length))
  } else if (varietyLevel === 'medium') {
    selectedIndex = Math.floor(Math.random() * Math.min(3, scored.length))
  }

  const selected = scored[selectedIndex].meal
  usedIds.add(selected.id)
  return selected
}

/**
 * Select meals for a full week based on settings
 */
function selectMealsForWeek(
  grouped: Record<string, Meal[]>,
  profile: UserProfile,
  settings: MealPlanSettings
): DayMeals[] {
  const weekPlan: DayMeals[] = []
  const usedMealIds = new Set<string>()

  for (let day = 0; day < 7; day++) {
    const dayMeals: Meal[] = []

    // Always add breakfast, lunch, dinner
    const breakfast = selectBestMeal(
      grouped.breakfast || [],
      profile,
      usedMealIds,
      settings.varietyLevel || 'medium'
    )
    if (breakfast) dayMeals.push(breakfast)

    const lunch = selectBestMeal(
      grouped.lunch || [],
      profile,
      usedMealIds,
      settings.varietyLevel || 'medium'
    )
    if (lunch) dayMeals.push(lunch)

    const dinner = selectBestMeal(
      grouped.dinner || [],
      profile,
      usedMealIds,
      settings.varietyLevel || 'medium'
    )
    if (dinner) dayMeals.push(dinner)

    // Add snacks based on mealsPerDay
    if ((settings.mealsPerDay || 3) >= 4) {
      const snack1 = selectBestMeal(
        grouped.snack || [],
        profile,
        usedMealIds,
        settings.varietyLevel || 'medium'
      )
      if (snack1) dayMeals.push(snack1)
    }
    if ((settings.mealsPerDay || 3) >= 5) {
      const snack2 = selectBestMeal(
        grouped.snack || [],
        profile,
        usedMealIds,
        settings.varietyLevel || 'medium'
      )
      if (snack2) dayMeals.push(snack2)
    }

    weekPlan.push({ day, meals: dayMeals })
  }

  return weekPlan
}

/**
 * Calculate totals for the entire meal plan
 */
function calculateTotals(days: DayMeals[]): {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFats: number
} {
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFats = 0

  for (const day of days) {
    for (const meal of day.meals) {
      totalCalories += meal.calories_per_serving || 0
      totalProtein += meal.protein_per_serving || 0
      totalCarbs += meal.carbs_per_serving || 0
      totalFats += meal.fats_per_serving || 0
    }
  }

  return { totalCalories, totalProtein, totalCarbs, totalFats }
}

// ============================================
// Main Matching Function
// ============================================

/**
 * Match meals from the database based on user profile and settings
 * This is the core function for instant meal plan generation
 */
export async function matchMeals({ profile, settings }: MealMatcherInput): Promise<WeeklyMealPlan> {
  const supabase = await createClient()

  // Best Practice: Always use explicit filters for better query performance
  // Even with RLS, explicit .eq() allows PostgreSQL to construct efficient query plans
  // Try user's locale first, fall back to 'en' if no meals found
  const userLocale = profile.locale || 'en'

  let query = supabase
    .from('meals')
    .select('*')
    .eq('is_seed_meal', true) // Explicit filter on indexed column
    .eq('locale', userLocale) // Filter by user's locale for i18n

  // Apply cuisine filter at database level for performance
  if (settings.cuisineType && settings.cuisineType !== 'any') {
    query = query.eq('cuisine_type', settings.cuisineType)
  }

  // Apply time constraint at database level
  if (settings.prepTimeMax) {
    query = query.lte('prep_time', settings.prepTimeMax)
  }

  // Apply skill level filter
  const skillLevels = getSkillLevels(profile.cooking_skill_level)
  query = query.in('difficulty_level', skillLevels)

  let { data: meals, error } = await query

  if (error) {
    throw new Error(`Failed to fetch meals: ${error.message}`)
  }

  // Fallback to 'en' locale if no meals found for user's locale
  if ((!meals || meals.length === 0) && userLocale !== 'en') {
    let fallbackQuery = supabase
      .from('meals')
      .select('*')
      .eq('is_seed_meal', true)
      .eq('locale', 'en')

    if (settings.cuisineType && settings.cuisineType !== 'any') {
      fallbackQuery = fallbackQuery.eq('cuisine_type', settings.cuisineType)
    }
    if (settings.prepTimeMax) {
      fallbackQuery = fallbackQuery.lte('prep_time', settings.prepTimeMax)
    }
    fallbackQuery = fallbackQuery.in('difficulty_level', skillLevels)

    const fallbackResult = await fallbackQuery
    meals = fallbackResult.data
    error = fallbackResult.error

    if (error) {
      throw new Error(`Failed to fetch meals: ${error.message}`)
    }
  }

  if (!meals || meals.length === 0) {
    throw new Error('No seed meals available. Please run the seed script first.')
  }

  // Filter by dietary preference and allergies (in-memory for complex logic)
  const eligibleMeals = filterByDietaryNeeds(meals as Meal[], profile)

  if (eligibleMeals.length === 0) {
    throw new Error('No meals match your dietary preferences and allergies.')
  }

  // Group by meal type
  const grouped = groupByMealType(eligibleMeals)

  // Select meals for 7 days
  const days = selectMealsForWeek(grouped, profile, settings)

  // Calculate totals
  const totals = calculateTotals(days)

  return {
    days,
    ...totals,
  }
}
