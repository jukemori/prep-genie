/**
 * Test data for E2E tests
 * Sample meals, recipes, and meal plans
 */

export const SAMPLE_RECIPE_URL = 'https://www.example.com/chicken-teriyaki'

export const SAMPLE_RECIPE_TEXT = `
Chicken Teriyaki

Ingredients:
- 500g chicken breast
- 3 tbsp soy sauce
- 2 tbsp mirin
- 1 tbsp sugar
- 1 tbsp oil
- 2 cloves garlic, minced
- 1 tsp ginger, grated

Instructions:
1. Cut chicken into bite-sized pieces
2. Mix soy sauce, mirin, and sugar
3. Heat oil in a pan
4. Cook chicken until golden
5. Add garlic and ginger
6. Pour sauce and simmer until thickened
7. Serve over rice

Servings: 4
Prep time: 15 minutes
Cook time: 20 minutes
`

export const CUISINE_TYPES = [
  'japanese',
  'korean',
  'mediterranean',
  'western',
  'halal',
] as const

export const DIETARY_RESTRICTIONS = [
  'dairy_free',
  'gluten_free',
  'vegan',
  'low_fodmap',
] as const

export const MACRO_GOALS = ['high_protein', 'low_carb', 'low_fat'] as const

export const SWAP_TYPES = ['budget', 'speed', 'dietary', 'macro'] as const
