export const RECIPE_ANALYZER_SYSTEM_PROMPT = `You are PrepGenie's AI recipe nutrition analyzer, an expert in extracting recipe information, calculating accurate nutrition data, and suggesting recipe improvements.

**Your Capabilities:**
- Extract structured recipe data from URLs or raw text
- Calculate precise nutrition information for recipes
- Suggest budget-friendly ingredient alternatives
- Provide high-protein recipe modifications
- Create lower-calorie versions of recipes
- Maintain recipe integrity while improving nutritional profile

**Nutritional Accuracy:**
- Calculate macros based on ingredient quantities
- Protein: 4 calories/gram, Carbs: 4 calories/gram, Fats: 9 calories/gram
- Total calories should match macro calculations
- Account for cooking methods and oil/butter additions
- Use USDA nutritional database standards

**Response Format:**
Return ONLY valid JSON following the exact structure specified. No markdown, no explanations.`

export function generateRecipeAnalysisPrompt(recipeInput: string, locale: 'en' | 'ja' = 'en') {
  const isJapanese = locale === 'ja'

  const localeInstructions = isJapanese
    ? `**日本語対応:**
- すべての応答を日本語で生成してください
- カップ: 200mL（米国の240mLではありません）
- 重量: kg、g
- 温度: 摂氏（℃）
- 通貨: ¥（円）
`
    : `**Language:**
- Respond in English
- Cups: 240mL (US standard)
- Weight: kg, g (metric)
- Temperature: Celsius (°C)
- Currency: $ (USD)
`

  return `${localeInstructions}

Analyze the following recipe and extract complete nutrition information:

**Recipe Input:**
${recipeInput}

**Requirements:**
1. Extract recipe name, description, and servings
2. Parse all ingredients with quantities and units
3. Categorize ingredients (produce, protein, dairy, grains, pantry, spices, other)
4. Extract cooking instructions as step-by-step array
5. Estimate prep time and cook time
6. Calculate accurate nutrition per serving:
   - Total calories
   - Protein (grams)
   - Carbohydrates (grams)
   - Fats (grams)

7. Generate THREE improvement versions:

   a) **Budget Version:**
   - Suggest cheaper ingredient alternatives
   - Maintain similar nutrition and flavor profile
   - Calculate estimated cost savings (percentage)
   - List specific ingredient swaps with savings amount

   b) **High-Protein Version:**
   - Replace or add ingredients to boost protein content
   - Maintain reasonable calorie levels
   - Calculate new total protein amount
   - List specific ingredient swaps with protein boost amount

   c) **Lower-Calorie Version:**
   - Suggest lower-calorie alternatives
   - Maintain satiety and flavor
   - Calculate new total calorie amount
   - List specific ingredient swaps with calorie reduction

**Output Format (JSON):**
{
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
  "servings": number,
  "prep_time": number (minutes),
  "cook_time": number (minutes),
  "nutrition": {
    "calories": number (per serving),
    "protein": number (grams per serving),
    "carbs": number (grams per serving),
    "fats": number (grams per serving)
  },
  "improvements": {
    "budget": {
      "description": "Brief explanation of cost-saving approach",
      "ingredient_swaps": [
        {
          "original": "ingredient name",
          "replacement": "cheaper alternative",
          "savings": "e.g., 30% cheaper"
        }
      ],
      "estimated_savings": "e.g., 25% total cost reduction"
    },
    "high_protein": {
      "description": "Brief explanation of protein-boosting approach",
      "ingredient_swaps": [
        {
          "original": "ingredient name",
          "replacement": "high-protein alternative",
          "protein_boost": "e.g., +15g protein"
        }
      ],
      "new_protein": number (grams per serving)
    },
    "lower_calorie": {
      "description": "Brief explanation of calorie-reduction approach",
      "ingredient_swaps": [
        {
          "original": "ingredient name",
          "replacement": "lower-calorie alternative",
          "calorie_reduction": "e.g., -100 kcal"
        }
      ],
      "new_calories": number (per serving)
    }
  }
}`
}
