'use server'

import { revalidatePath } from 'next/cache'
import {
  generateRecipeAnalysisPrompt,
  RECIPE_ANALYZER_SYSTEM_PROMPT,
} from '@/features/recipes/prompts/recipe-analyzer'
import { openai } from '@/lib/ai/openai'
import { createClient } from '@/lib/supabase/server'

interface AnalyzeRecipeInput {
  input: string
  inputType: 'url' | 'text'
  locale: 'en' | 'ja'
}

export async function analyzeRecipe(data: AnalyzeRecipeInput) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // For URL input, we'll need to fetch the content
    // For now, we'll treat it as text (URL scraping can be added later)
    const recipeText = data.input

    const prompt = generateRecipeAnalysisPrompt(recipeText, data.locale)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: RECIPE_ANALYZER_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return { error: 'Failed to analyze recipe' }
    }

    const analyzedRecipe = JSON.parse(content)

    return { data: analyzedRecipe }
  } catch (error) {
    console.error('Recipe analysis error:', error)
    return { error: 'Failed to analyze recipe' }
  }
}

interface SaveAnalyzedRecipeInput {
  recipe: {
    name: string
    description: string
    ingredients: Array<{
      name: string
      quantity: number
      unit: string
      category: string
    }>
    instructions: string[]
    servings: number
    prep_time: number
    cook_time: number
    nutrition: {
      calories: number
      protein: number
      carbs: number
      fats: number
    }
  }
  version?: 'original' | 'budget' | 'high_protein' | 'lower_calorie'
}

export async function saveAnalyzedRecipe(data: SaveAnalyzedRecipeInput) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const { recipe, version = 'original' } = data

    // Add version tag if not original
    const tags = version !== 'original' ? [version] : []

    const { data: savedMeal, error } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        servings: recipe.servings,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        calories_per_serving: recipe.nutrition.calories,
        protein_per_serving: recipe.nutrition.protein,
        carbs_per_serving: recipe.nutrition.carbs,
        fats_per_serving: recipe.nutrition.fats,
        tags,
        is_ai_generated: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return { error: error.message }
    }

    revalidatePath('/meals')

    return { data: savedMeal }
  } catch (error) {
    console.error('Save recipe error:', error)
    return { error: 'Failed to save recipe' }
  }
}
