#!/usr/bin/env npx tsx
/**
 * Seed Meals Script
 *
 * Inserts pre-generated meals from meals-data.json into the database.
 * Run with: pnpm seed:meals --locale=en or pnpm seed:meals --locale=ja
 */

import dotenv from 'dotenv'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Parse command line arguments
const args = process.argv.slice(2)
const localeArg = args.find((arg) => arg.startsWith('--locale='))
const locale = (localeArg?.split('=')[1] || 'en') as 'en' | 'ja'

console.log(`🍳 Seeding meals for locale: ${locale}`)

interface MealData {
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

async function loadMeals(locale: 'en' | 'ja'): Promise<MealData[]> {
  const dataPath = join(__dirname, `meals-data-${locale}.json`)
  const rawData = readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(rawData)
  return data.meals as MealData[]
}

async function insertMeals(meals: MealData[], locale: 'en' | 'ja'): Promise<number> {
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
      is_ai_generated: false, // These are handcrafted, not AI generated
      tags: [],
    })

    if (error) {
      console.error(`Failed to insert meal "${meal.name}":`, error.message)
    } else {
      inserted++
      if (inserted % 10 === 0) {
        console.log(`  Inserted ${inserted} meals...`)
      }
    }
  }

  return inserted
}

async function main() {
  const meals = await loadMeals(locale)

  console.log(`\n📊 Loaded ${meals.length} meals from meals-data-${locale}.json`)

  // Count by meal type
  const counts = {
    breakfast: meals.filter(m => m.meal_type === 'breakfast').length,
    lunch: meals.filter(m => m.meal_type === 'lunch').length,
    dinner: meals.filter(m => m.meal_type === 'dinner').length,
    snack: meals.filter(m => m.meal_type === 'snack').length,
  }

  console.log('\nMeal distribution:')
  console.log(`  Breakfast: ${counts.breakfast}`)
  console.log(`  Lunch: ${counts.lunch}`)
  console.log(`  Dinner: ${counts.dinner}`)
  console.log(`  Snack: ${counts.snack}`)

  console.log(`\n🚀 Inserting meals into database...`)
  const inserted = await insertMeals(meals, locale)

  console.log(`\n✅ Done! Total meals inserted: ${inserted}`)
  console.log(`   Locale: ${locale}`)
}

main().catch(console.error)
