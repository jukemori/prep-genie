import type { UserProfile } from '@/types'

import { getCuisineGuidance } from './cultural-cuisine-guidelines'

export const MEAL_PLAN_GENERATOR_SYSTEM_PROMPT = `You are PrepGenie's AI meal plan generator, an expert in creating personalized, balanced meal plans that meet specific nutritional goals.

**Nutritional Accuracy:**
- Calculate macros based on ingredient quantities
- Protein: 4 calories/gram, Carbs: 4 calories/gram, Fats: 9 calories/gram
- Total calories should match macro calculations
- Account for cooking methods (oil, butter, etc.)

**Response Format:**
Return ONLY valid JSON following the exact structure specified. No markdown, no explanations.`

export function generateMealPlanPrompt(
  profile: UserProfile,
  locale: 'en' | 'ja' = 'en',
  cuisineType?: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal'
) {
  const isJapanese = locale === 'ja'
  const units = isJapanese ? 'Cup: 200mL, kg/g, °C, ¥' : 'Cup: 240mL, kg/g, °C, $'

  // Add cuisine-specific guidance if cuisineType is specified
  const cuisineGuidance = cuisineType
    ? `\n${getCuisineGuidance(cuisineType)}\n\n**Follow ${cuisineType} cuisine guidelines with authentic ingredients and methods.**\n`
    : ''

  return `Generate 7-day meal plan (3 meals/day) in ${isJapanese ? '日本語' : 'English'}. Units: ${units}

**Profile:** Age ${profile.age}, ${profile.weight}kg, ${profile.height}cm, ${profile.gender}, ${profile.activity_level}, ${profile.goal}, ${profile.dietary_preference}${profile.allergies?.length ? `, NO ${profile.allergies.join('/')}` : ''}, ${profile.cooking_skill_level || 'intermediate'} skill, ${profile.time_available || 60}min/day, ${profile.budget_level || 'medium'} budget

**Targets:** ${profile.daily_calorie_target}kcal, ${profile.target_protein}g protein, ${profile.target_carbs}g carbs, ${profile.target_fats}g fat
${cuisineGuidance}
**JSON Output:**
{
  "week_summary": {"total_calories": num, "avg_calories_per_day": num, "total_protein": num, "total_carbs": num, "total_fats": num},
  "meal_plan": [{
    "day": 1-7,
    "meals": [{
      "meal_type": "breakfast|lunch|dinner",
      "name": "str",
      "description": "str",
      "ingredients": [{"name": "str", "quantity": num, "unit": "str", "category": "produce|protein|dairy|grains|pantry|spices|other"}],
      "instructions": ["str"],
      "prep_time": num,
      "cook_time": num,
      "servings": num,
      "nutrition_per_serving": {"calories": num, "protein": num, "carbs": num, "fats": num},
      "tags": ["str"],
      "cuisine_type": "str",
      "difficulty_level": "easy|medium|hard",
      "meal_prep_friendly": bool,
      "storage_instructions": "str",
      "reheating_instructions": "str",
      "storage_duration_days": num,
      "container_type": "glass|plastic|freezer-safe|null",
      "batch_cooking_multiplier": num
    }]
  }]
}`
}

/**
 * Generate prompt for a single day (3 meals) - used for chunked generation
 * This reduces token usage and works better with GPT-5-nano
 */
export function generateSingleDayPrompt(
  profile: UserProfile,
  dayNumber: number,
  locale: 'en' | 'ja' = 'en',
  cuisineType?: 'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal'
) {
  const isJapanese = locale === 'ja'
  const units = isJapanese ? 'Cup: 200mL, kg/g, °C, ¥' : 'Cup: 240mL, kg/g, °C, $'

  const cuisineGuidance = cuisineType
    ? `\n${getCuisineGuidance(cuisineType)}\n\n**Follow ${cuisineType} cuisine guidelines.**\n`
    : ''

  return `Generate Day ${dayNumber} meals (breakfast, lunch, dinner) in ${isJapanese ? '日本語' : 'English'}. Units: ${units}

**Profile:** ${profile.age}y, ${profile.weight}kg, ${profile.height}cm, ${profile.gender}, ${profile.activity_level}, ${profile.goal}, ${profile.dietary_preference}${profile.allergies?.length ? `, NO ${profile.allergies.join('/')}` : ''}, ${profile.cooking_skill_level || 'intermediate'} skill, ${profile.time_available || 60}min/day, ${profile.budget_level || 'medium'} budget

**Daily Targets:** ${profile.daily_calorie_target}kcal, ${profile.target_protein}g protein, ${profile.target_carbs}g carbs, ${profile.target_fats}g fat
${cuisineGuidance}
**JSON Output:**
{
  "day": ${dayNumber},
  "meals": [{
    "meal_type": "breakfast|lunch|dinner",
    "name": "str",
    "description": "str",
    "ingredients": [{"name": "str", "quantity": num, "unit": "str", "category": "produce|protein|dairy|grains|pantry|spices|other"}],
    "instructions": ["str"],
    "prep_time": num,
    "cook_time": num,
    "servings": num,
    "nutrition_per_serving": {"calories": num, "protein": num, "carbs": num, "fats": num},
    "tags": ["str"],
    "cuisine_type": "str",
    "difficulty_level": "easy|medium|hard",
    "meal_prep_friendly": bool,
    "storage_instructions": "str",
    "reheating_instructions": "str",
    "storage_duration_days": num,
    "container_type": "glass|plastic|freezer-safe|null",
    "batch_cooking_multiplier": num
  }]
}`
}

export function modifyMealPrompt(
  mealName: string,
  currentIngredients: string[],
  modification: string
) {
  return `You are a nutrition expert. Modify the following meal based on the user's request:

**Current Meal:** ${mealName}
**Current Ingredients:** ${currentIngredients.join(', ')}
**Modification Request:** ${modification}

Please provide:
1. Updated ingredient list with quantities
2. Updated instructions
3. Updated nutrition information (calories, protein, carbs, fats per serving)
4. Brief explanation of changes made

Output as JSON with the same structure as the original meal.`
}

export function substituteIngredientPrompt(
  ingredient: string,
  reason: string,
  mealContext: string
) {
  return `Suggest ${reason === 'allergy' ? 'allergy-safe' : 'suitable'} substitutes for "${ingredient}" in the context of: ${mealContext}

Provide 3 substitution options with:
1. Substitute ingredient name
2. Quantity adjustment (if needed)
3. Impact on nutrition
4. Impact on flavor/texture

Output as JSON array.`
}
