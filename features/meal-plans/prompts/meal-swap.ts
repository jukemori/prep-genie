export const MEAL_SWAP_SYSTEM_PROMPT = `You are PrepGenie's AI meal swap engine, an expert in suggesting alternative meals that maintain nutrition profiles while meeting specific criteria.

**Your Capabilities:**
- Generate budget-friendly meal alternatives
- Suggest faster/easier meal options
- Create dietary restriction-compliant swaps (dairy-free, gluten-free, vegan, etc.)
- Provide macro-focused alternatives (high-protein, low-carb, etc.)
- Maintain similar nutrition profiles and user preferences
- Preserve allergen safety

**Nutritional Accuracy:**
- Match calorie targets within ±100 kcal
- Maintain macro ratios or adjust per swap type
- Calculate accurate nutrition for all suggestions
- Protein: 4 kcal/g, Carbs: 4 kcal/g, Fats: 9 kcal/g

**Response Format:**
Return ONLY valid JSON following the exact structure specified. No markdown, no explanations.`

interface MealSwapContext {
  originalMeal: {
    name: string
    calories: number
    protein: number
    carbs: number
    fats: number
    mealType: string
  }
  userPreferences: {
    dietaryPreference: string
    allergies: string[]
    cookingSkill: string
    timeAvailable: number
    budgetLevel: string
  }
  locale: 'en' | 'ja'
}

export function generateBudgetSwapPrompt(context: MealSwapContext) {
  const { originalMeal, userPreferences, locale } = context
  const isJapanese = locale === 'ja'

  const localeInstructions = isJapanese
    ? `**日本語対応:**
- すべての応答を日本語で生成してください
- カップ: 200mL
- 重量: kg、g
- 温度: 摂氏（℃）
- 通貨: ¥（円）
`
    : `**Language:**
- Respond in English
- Cups: 240mL (US standard)
- Weight: kg, g
- Currency: $ (USD)
`

  return `${localeInstructions}

Generate a budget-friendly meal swap for:

**Original Meal:** ${originalMeal.name}
- Meal Type: ${originalMeal.mealType}
- Calories: ${originalMeal.calories} kcal
- Protein: ${originalMeal.protein}g
- Carbs: ${originalMeal.carbs}g
- Fats: ${originalMeal.fats}g

**User Preferences:**
- Dietary Preference: ${userPreferences.dietaryPreference}
- Allergies: ${userPreferences.allergies.join(', ') || 'None'}
- Cooking Skill: ${userPreferences.cookingSkill}
- Time Available: ${userPreferences.timeAvailable} minutes
- Budget Level: ${userPreferences.budgetLevel}

**Requirements:**
1. Suggest a similar meal using cheaper ingredients
2. Maintain nutrition profile within ±100 kcal and ±10g macros
3. Respect dietary preferences and allergies
4. Keep similar flavor profile and meal type
5. Provide cost comparison (percentage cheaper)
6. Include complete recipe details

**Output Format (JSON):**
{
  "name": "string",
  "description": "string (why this is a good budget swap)",
  "cost_savings": "string (e.g., '30% cheaper')",
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
  }
}`
}

export function generateSpeedSwapPrompt(context: MealSwapContext) {
  const { originalMeal, userPreferences, locale } = context
  const isJapanese = locale === 'ja'

  const localeInstructions = isJapanese
    ? `**日本語対応:**
- すべての応答を日本語で生成してください
- カップ: 200mL
- 重量: kg、g
- 温度: 摂氏（℃）
`
    : `**Language:**
- Respond in English
- Cups: 240mL (US standard)
- Weight: kg, g
`

  return `${localeInstructions}

Generate a faster/easier meal swap for:

**Original Meal:** ${originalMeal.name}
- Meal Type: ${originalMeal.mealType}
- Calories: ${originalMeal.calories} kcal
- Protein: ${originalMeal.protein}g
- Carbs: ${originalMeal.carbs}g
- Fats: ${originalMeal.fats}g

**User Preferences:**
- Dietary Preference: ${userPreferences.dietaryPreference}
- Allergies: ${userPreferences.allergies.join(', ') || 'None'}
- Cooking Skill: ${userPreferences.cookingSkill}
- Time Available: ${userPreferences.timeAvailable} minutes
- Budget Level: ${userPreferences.budgetLevel}

**Requirements:**
1. Suggest faster cooking methods or pre-prepped ingredients
2. Reduce total time by at least 30%
3. Maintain nutrition profile within ±100 kcal and ±10g macros
4. Respect dietary preferences and allergies
5. Keep similar flavor profile and meal type
6. Specify time saved in description
7. Include complete recipe details

**Output Format (JSON):**
{
  "name": "string",
  "description": "string (explain why this is faster + time saved, e.g., '15 minutes faster than original')",
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
  }
}`
}

export function generateDietarySwapPrompt(
  context: MealSwapContext,
  dietaryRestriction: 'dairy_free' | 'gluten_free' | 'vegan' | 'low_fodmap'
) {
  const { originalMeal, userPreferences, locale } = context
  const isJapanese = locale === 'ja'

  const restrictionLabels = {
    dairy_free: isJapanese ? '乳製品不使用' : 'Dairy-Free',
    gluten_free: isJapanese ? 'グルテンフリー' : 'Gluten-Free',
    vegan: isJapanese ? 'ヴィーガン' : 'Vegan',
    low_fodmap: isJapanese ? '低FODMAP' : 'Low-FODMAP',
  }

  const localeInstructions = isJapanese
    ? `**日本語対応:**
- すべての応答を日本語で生成してください
- カップ: 200mL
- 重量: kg、g
`
    : `**Language:**
- Respond in English
- Cups: 240mL (US standard)
- Weight: kg, g
`

  return `${localeInstructions}

Create a ${restrictionLabels[dietaryRestriction]} version of:

**Original Meal:** ${originalMeal.name}
- Meal Type: ${originalMeal.mealType}
- Calories: ${originalMeal.calories} kcal
- Protein: ${originalMeal.protein}g
- Carbs: ${originalMeal.carbs}g
- Fats: ${originalMeal.fats}g

**User Preferences:**
- Current Dietary Preference: ${userPreferences.dietaryPreference}
- Allergies: ${userPreferences.allergies.join(', ') || 'None'}
- Cooking Skill: ${userPreferences.cookingSkill}
- Time Available: ${userPreferences.timeAvailable} minutes

**Requirements:**
1. Replace all ingredients that contain the restricted item
2. Maintain similar nutrition profile within ±100 kcal and ±10g macros
3. Keep similar flavor and texture where possible
4. Respect existing allergies
5. Specify what was substituted in description
6. Include complete recipe details

**Output Format (JSON):**
{
  "name": "string",
  "description": "string (explain substitutions made, e.g., 'Uses almond milk instead of dairy milk')",
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
  }
}`
}

export function generateMacroSwapPrompt(
  context: MealSwapContext,
  macroGoal: 'high_protein' | 'low_carb' | 'low_fat'
) {
  const { originalMeal, userPreferences, locale } = context
  const isJapanese = locale === 'ja'

  const goalLabels = {
    high_protein: isJapanese ? '高タンパク質' : 'High-Protein',
    low_carb: isJapanese ? '低炭水化物' : 'Low-Carb',
    low_fat: isJapanese ? '低脂肪' : 'Low-Fat',
  }

  const targets = {
    high_protein: `Increase protein by at least 20g`,
    low_carb: `Reduce carbs by at least 30%`,
    low_fat: `Reduce fats by at least 30%`,
  }

  const localeInstructions = isJapanese
    ? `**日本語対応:**
- すべての応答を日本語で生成してください
- カップ: 200mL
- 重量: kg、g
`
    : `**Language:**
- Respond in English
- Cups: 240mL (US standard)
- Weight: kg, g
`

  return `${localeInstructions}

Create a ${goalLabels[macroGoal]} version of:

**Original Meal:** ${originalMeal.name}
- Meal Type: ${originalMeal.mealType}
- Current Nutrition: ${originalMeal.calories} kcal, ${originalMeal.protein}g protein, ${originalMeal.carbs}g carbs, ${originalMeal.fats}g fats

**User Preferences:**
- Dietary Preference: ${userPreferences.dietaryPreference}
- Allergies: ${userPreferences.allergies.join(', ') || 'None'}
- Cooking Skill: ${userPreferences.cookingSkill}
- Time Available: ${userPreferences.timeAvailable} minutes

**Macro Goal:** ${targets[macroGoal]}

**Requirements:**
1. Modify ingredients to achieve macro goal
2. Keep calories within ±150 kcal
3. Maintain meal satisfaction and flavor
4. Respect dietary preferences and allergies
5. Specify macro improvements in description
6. Include complete recipe details

**Output Format (JSON):**
{
  "name": "string",
  "description": "string (explain macro changes, e.g., 'High-protein version with +25g protein using Greek yogurt')",
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
  }
}`
}
