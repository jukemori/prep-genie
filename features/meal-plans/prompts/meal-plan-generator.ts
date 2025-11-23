import type { UserProfile } from '@/types'

import { type CuisineType, getCuisineGuidance } from './cultural-cuisine-guidelines'

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

  const localeInstructions = isJapanese
    ? `**日本語対応:**
- すべての応答を日本語で生成してください
- カップ: 200mL（米国の240mLではありません）
- 重量: kg、g
- 温度: 摂氏（℃）
- 通貨: ¥（円）
`
    : `**English Language:**
- Generate all responses in English
- Cups: 240mL (US standard)
- Weight: kg, g (metric standard)
- Temperature: Celsius (°C)
- Currency: $ (USD)
`

  // Add cuisine-specific guidance if cuisineType is specified
  const cuisineGuidance = cuisineType
    ? `\n${getCuisineGuidance(cuisineType)}\n\n**IMPORTANT:** All meals MUST follow the ${cuisineType} cuisine guidelines above. Use authentic ingredients, cooking methods, and meal structures specific to this cuisine.\n`
    : ''

  return `Generate a personalized meal plan based on the following user profile:

**User Profile:**
- Age: ${profile.age}
- Weight: ${profile.weight}kg
- Height: ${profile.height}cm
- Gender: ${profile.gender}
- Activity Level: ${profile.activity_level}
- Goal: ${profile.goal}
- Dietary Preference: ${profile.dietary_preference}
- Allergies: ${profile.allergies?.join(', ') || 'None'}
- Cooking Skill: ${profile.cooking_skill_level || 'intermediate'}
- Time Available: ${profile.time_available || 60} minutes per day
- Budget: ${profile.budget_level || 'medium'}

**Nutrition Targets:**
- Daily Calories: ${profile.daily_calorie_target} kcal
- Protein: ${profile.target_protein}g
- Carbs: ${profile.target_carbs}g
- Fats: ${profile.target_fats}g

${localeInstructions}
${cuisineGuidance}
**Requirements:**
1. Generate a complete weekly meal plan (7 days)
2. Include 3 main meals per day (breakfast, lunch, dinner)
3. Each meal should include:
   - Name
   - Description
   - Detailed ingredients with quantities
   - Step-by-step instructions
   - Prep time and cook time
   - Nutrition per serving (calories, protein, carbs, fats)
   - Servings
   - Meal prep information (storage, reheating, batch cooking recommendations)
4. Ensure meals align with dietary preferences and avoid allergens
5. Consider cooking skill level and time constraints
6. ${cuisineType ? `Focus exclusively on ${cuisineType} cuisine with authentic recipes` : 'Vary cuisine types for diversity'}
7. Optimize for batch cooking where possible (mark meal_prep_friendly: true for suitable meals)
8. For meal prep friendly meals, provide:
   - Clear storage instructions
   - Reheating instructions
   - Storage duration (how many days it stays fresh)
   - Recommended container type
   - Suggested batch cooking multiplier (e.g., 4x for meal prepping 4 portions)

**Output Format (JSON):**
{
  "week_summary": {
    "total_calories": number,
    "avg_calories_per_day": number,
    "total_protein": number,
    "total_carbs": number,
    "total_fats": number
  },
  "meal_plan": [
    {
      "day": 1-7,
      "meals": [
        {
          "meal_type": "breakfast" | "lunch" | "dinner",
          "name": "string",
          "description": "string",
          "ingredients": [
            {
              "name": "string",
              "quantity": number,
              "unit": "string",
              "category": "produce" | "protein" | "dairy" | "grains" | "pantry" | "spices" | "other"
            }
          ],
          "instructions": ["step1", "step2", ...],
          "prep_time": number (minutes),
          "cook_time": number (minutes),
          "servings": number,
          "nutrition_per_serving": {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fats": number
          },
          "tags": ["tag1", "tag2", ...],
          "cuisine_type": "string",
          "difficulty_level": "easy" | "medium" | "hard",
          "meal_prep_friendly": boolean,
          "storage_instructions": "string (how to store)",
          "reheating_instructions": "string (how to reheat)",
          "storage_duration_days": number (how many days it keeps),
          "container_type": "glass" | "plastic" | "freezer-safe" | null,
          "batch_cooking_multiplier": number (recommended batch size, e.g. 4 for 4x recipe)
        }
      ]
    }
  ]
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
