#!/usr/bin/env npx tsx
/**
 * Seed Meals Script
 *
 * Generates seed meals using GPT and inserts them into the database.
 * Run with: pnpm seed:meals --locale=en or pnpm seed:meals --locale=ja
 */

import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import type { Database } from '../types/database'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  console.error('- OPENAI_API_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// Parse command line arguments
const args = process.argv.slice(2)
const localeArg = args.find((arg) => arg.startsWith('--locale='))
const locale = (localeArg?.split('=')[1] || 'en') as 'en' | 'ja'

console.log(`🍳 Generating seed meals for locale: ${locale}`)

// Meal distribution
const MEAL_CONFIG = {
  breakfast: { count: 15, desc: '5 quick (<15min), 5 standard, 5 meal-prep friendly' },
  lunch: { count: 20, desc: 'Variety of proteins, cuisines, prep times' },
  dinner: { count: 20, desc: 'Mix of quick weeknight + elaborate weekend' },
  snack: { count: 15, desc: 'Protein-focused, low-cal, balanced options' },
}

const CUISINES = ['japanese', 'korean', 'mediterranean', 'western', 'halal'] as const
const DIETARY_TAGS = [
  'vegetarian',
  'vegan',
  'gluten_free',
  'dairy_free',
  'halal',
  'low_carb',
  'high_protein',
  'nut_free',
  'egg_free',
  'shellfish_free',
] as const

interface GeneratedMeal {
  name: string
  description: string
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
    category: string
  }>
  instructions: string[]
  prep_time: number
  cook_time: number
  servings: number
  calories_per_serving: number
  protein_per_serving: number
  carbs_per_serving: number
  fats_per_serving: number
  cuisine_type: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  dietary_tags: string[]
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
}

const SYSTEM_PROMPT = `You are a professional nutritionist and chef creating a meal database.
Generate meals with accurate nutrition information, realistic cooking times, and clear instructions.
Return ONLY valid JSON array with no markdown formatting.`

function generateBatchPrompt(
  mealType: string,
  count: number,
  cuisine: string,
  locale: 'en' | 'ja'
): string {
  const isJapanese = locale === 'ja'

  return `Generate ${count} ${mealType} meals for ${cuisine} cuisine.
${isJapanese ? 'All content (names, descriptions, instructions) must be in Japanese (日本語).' : 'All content must be in English.'}

Requirements:
- Include realistic nutrition values
- Include appropriate dietary_tags from: ${DIETARY_TAGS.join(', ')}
- Vary difficulty levels (easy, medium, hard)
- Vary prep times appropriately for ${mealType}

Return JSON array:
[{
  "name": "${isJapanese ? '日本語の名前' : 'English name'}",
  "description": "${isJapanese ? '日本語の説明' : 'English description'}",
  "ingredients": [{"name": "str", "quantity": num, "unit": "g/ml/tbsp/tsp/cups", "category": "produce|protein|dairy|grains|pantry|spices"}],
  "instructions": ["${isJapanese ? '日本語のステップ' : 'English step'}"],
  "prep_time": num,
  "cook_time": num,
  "servings": num,
  "calories_per_serving": num,
  "protein_per_serving": num,
  "carbs_per_serving": num,
  "fats_per_serving": num,
  "cuisine_type": "${cuisine}",
  "difficulty_level": "easy|medium|hard",
  "dietary_tags": ["from list above"],
  "meal_type": "${mealType}"
}]`
}

async function generateMeals(
  mealType: string,
  count: number,
  cuisine: string,
  locale: 'en' | 'ja'
): Promise<GeneratedMeal[]> {
  const prompt = generateBatchPrompt(mealType, count, cuisine, locale)

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content)
    // Handle both { meals: [...] } and [...] formats
    const meals = Array.isArray(parsed) ? parsed : parsed.meals || []
    return meals as GeneratedMeal[]
  } catch (error) {
    console.error(`Error generating ${mealType} meals for ${cuisine}:`, error)
    return []
  }
}

async function insertMeals(meals: GeneratedMeal[], locale: 'en' | 'ja'): Promise<number> {
  let inserted = 0

  for (const meal of meals) {
    const { error } = await supabase.from('meals').insert({
      user_id: null, // System-owned seed meal
      name: meal.name,
      description: meal.description,
      ingredients:
        meal.ingredients as unknown as Database['public']['Tables']['meals']['Insert']['ingredients'],
      instructions: meal.instructions,
      prep_time: meal.prep_time,
      cook_time: meal.cook_time,
      servings: meal.servings,
      calories_per_serving: meal.calories_per_serving,
      protein_per_serving: meal.protein_per_serving,
      carbs_per_serving: meal.carbs_per_serving,
      fats_per_serving: meal.fats_per_serving,
      cuisine_type: meal.cuisine_type,
      meal_type: meal.meal_type,
      difficulty_level: meal.difficulty_level,
      dietary_tags: meal.dietary_tags,
      is_seed_meal: true,
      locale: locale,
      is_public: true,
      is_ai_generated: true,
      tags: [],
    })

    if (error) {
      console.error(`Failed to insert meal "${meal.name}":`, error.message)
    } else {
      inserted++
    }
  }

  return inserted
}

async function main() {
  console.log('\n📊 Meal Distribution:')
  for (const [type, config] of Object.entries(MEAL_CONFIG)) {
    console.log(`  ${type}: ${config.count} (${config.desc})`)
  }

  let totalInserted = 0

  for (const [mealType, config] of Object.entries(MEAL_CONFIG)) {
    console.log(`\n🍽️  Generating ${config.count} ${mealType} meals...`)

    // Distribute meals across cuisines
    const mealsPerCuisine = Math.ceil(config.count / CUISINES.length)

    for (const cuisine of CUISINES) {
      const count = Math.min(mealsPerCuisine, config.count - (totalInserted % config.count))
      console.log(`  → ${cuisine}: ${count} meals`)

      const meals = await generateMeals(mealType, count, cuisine, locale)
      console.log(`    Generated: ${meals.length} meals`)

      if (meals.length > 0) {
        const inserted = await insertMeals(meals, locale)
        totalInserted += inserted
        console.log(`    Inserted: ${inserted} meals`)
      }

      // Rate limit protection
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  console.log(`\n✅ Done! Total meals inserted: ${totalInserted}`)
  console.log(`   Locale: ${locale}`)
}

main().catch(console.error)
