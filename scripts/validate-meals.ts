#!/usr/bin/env npx tsx
/**
 * Validate Meals Script
 *
 * Validates seed meal data for consistency and quality.
 * Run with: pnpm validate:meals
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

interface Ingredient {
  name: string
  quantity: number
  unit: string
  category: string
}

interface MealData {
  name: string
  description: string
  ingredients: Ingredient[]
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

interface ValidationResult {
  locale: string
  totalMeals: number
  errors: string[]
  warnings: string[]
  stats: {
    byMealType: Record<string, number>
    byCuisine: Record<string, number>
    byDifficulty: Record<string, number>
    avgCalories: number
    avgProtein: number
  }
}

function validateMeals(locale: 'en' | 'ja'): ValidationResult {
  const dataPath = join(__dirname, `meals-data-${locale}.json`)
  const rawData = readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(rawData)
  const meals: MealData[] = data.meals

  const errors: string[] = []
  const warnings: string[] = []
  const names = new Set<string>()

  // Stats tracking
  const byMealType: Record<string, number> = {}
  const byCuisine: Record<string, number> = {}
  const byDifficulty: Record<string, number> = {}
  let totalCalories = 0
  let totalProtein = 0

  for (const meal of meals) {
    // Check for duplicate names
    if (names.has(meal.name)) {
      errors.push(`Duplicate meal name: "${meal.name}"`)
    }
    names.add(meal.name)

    // Check required fields
    if (!meal.name) errors.push('Missing name in meal')
    if (!meal.description) warnings.push(`Missing description: ${meal.name}`)
    if (!meal.ingredients?.length) errors.push(`No ingredients: ${meal.name}`)
    if (!meal.instructions?.length) errors.push(`No instructions: ${meal.name}`)

    // Check nutrition values
    if (meal.calories_per_serving <= 0) {
      errors.push(`Invalid calories (${meal.calories_per_serving}): ${meal.name}`)
    }
    if (meal.protein_per_serving < 0) {
      errors.push(`Invalid protein: ${meal.name}`)
    }
    if (meal.carbs_per_serving < 0) {
      errors.push(`Invalid carbs: ${meal.name}`)
    }
    if (meal.fats_per_serving < 0) {
      errors.push(`Invalid fats: ${meal.name}`)
    }

    // Check nutrition consistency (protein*4 + carbs*4 + fats*9 ≈ calories)
    const estimatedCals =
      meal.protein_per_serving * 4 + meal.carbs_per_serving * 4 + meal.fats_per_serving * 9

    const calorieDiff = Math.abs(estimatedCals - meal.calories_per_serving)
    if (calorieDiff > 100) {
      warnings.push(
        `Nutrition mismatch: ${meal.name} (estimated: ${Math.round(estimatedCals)}, actual: ${meal.calories_per_serving}, diff: ${Math.round(calorieDiff)})`
      )
    }

    // Check prep time
    if (meal.prep_time <= 0) {
      warnings.push(`Invalid prep_time: ${meal.name}`)
    }
    if (meal.prep_time > 120) {
      warnings.push(`Very long prep time (${meal.prep_time} min): ${meal.name}`)
    }

    // Check servings
    if (meal.servings <= 0) {
      errors.push(`Invalid servings: ${meal.name}`)
    }

    // Check valid meal_type
    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal.meal_type)) {
      errors.push(`Invalid meal_type "${meal.meal_type}": ${meal.name}`)
    }

    // Check valid difficulty_level
    if (!['easy', 'medium', 'hard'].includes(meal.difficulty_level)) {
      errors.push(`Invalid difficulty_level: ${meal.name}`)
    }

    // Check ingredients have required fields
    for (const ing of meal.ingredients) {
      if (!ing.name) errors.push(`Ingredient missing name in: ${meal.name}`)
      if (ing.quantity === undefined)
        warnings.push(`Ingredient "${ing.name}" missing quantity in: ${meal.name}`)
      if (!ing.unit) warnings.push(`Ingredient "${ing.name}" missing unit in: ${meal.name}`)
    }

    // Track stats
    byMealType[meal.meal_type] = (byMealType[meal.meal_type] || 0) + 1
    byCuisine[meal.cuisine_type] = (byCuisine[meal.cuisine_type] || 0) + 1
    byDifficulty[meal.difficulty_level] = (byDifficulty[meal.difficulty_level] || 0) + 1
    totalCalories += meal.calories_per_serving
    totalProtein += meal.protein_per_serving
  }

  return {
    locale,
    totalMeals: meals.length,
    errors,
    warnings,
    stats: {
      byMealType,
      byCuisine,
      byDifficulty,
      avgCalories: Math.round(totalCalories / meals.length),
      avgProtein: Math.round(totalProtein / meals.length),
    },
  }
}

function printResult(result: ValidationResult) {
  console.log(`\n${'='.repeat(50)}`)
  console.log(`Validation Results for: ${result.locale.toUpperCase()}`)
  console.log(`${'='.repeat(50)}`)
  console.log(`Total meals: ${result.totalMeals}`)

  console.log('\nMeal Type Distribution:')
  for (const [type, count] of Object.entries(result.stats.byMealType)) {
    console.log(`  ${type}: ${count}`)
  }

  console.log('\nCuisine Distribution:')
  for (const [cuisine, count] of Object.entries(result.stats.byCuisine)) {
    console.log(`  ${cuisine}: ${count}`)
  }

  console.log('\nDifficulty Distribution:')
  for (const [difficulty, count] of Object.entries(result.stats.byDifficulty)) {
    console.log(`  ${difficulty}: ${count}`)
  }

  console.log('\nNutrition Averages:')
  console.log(`  Avg Calories: ${result.stats.avgCalories}`)
  console.log(`  Avg Protein: ${result.stats.avgProtein}g`)

  if (result.errors.length > 0) {
    console.log(`\nERRORS (${result.errors.length}):`)
    for (const error of result.errors) {
      console.log(`  - ${error}`)
    }
  }

  if (result.warnings.length > 0) {
    console.log(`\nWARNINGS (${result.warnings.length}):`)
    for (const warning of result.warnings.slice(0, 10)) {
      console.log(`  - ${warning}`)
    }
    if (result.warnings.length > 10) {
      console.log(`  ... and ${result.warnings.length - 10} more warnings`)
    }
  }

  if (result.errors.length === 0) {
    console.log(`\n✅ All ${result.totalMeals} ${result.locale} meals passed validation`)
  } else {
    console.log(`\n❌ Validation failed with ${result.errors.length} errors`)
  }
}

async function main() {
  console.log('🔍 Validating seed meal data...\n')

  const enResult = validateMeals('en')
  const jaResult = validateMeals('ja')

  printResult(enResult)
  printResult(jaResult)

  const totalErrors = enResult.errors.length + jaResult.errors.length
  if (totalErrors > 0) {
    process.exit(1)
  }

  console.log('\n✅ All validations passed!')
}

main().catch(console.error)
