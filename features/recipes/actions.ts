'use server'

import { revalidatePath } from 'next/cache'
import {
  generateRecipeAnalysisPrompt,
  RECIPE_ANALYZER_SYSTEM_PROMPT,
} from '@/features/recipes/prompts/recipe-analyzer'
import { MODELS, openai } from '@/lib/ai/openai'
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

    let recipeText = data.input

    // Fetch URL content if inputType is 'url'
    if (data.inputType === 'url' && data.input.startsWith('http')) {
      try {
        const response = await fetch(data.input, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PrepGenie/1.0; +https://prepgenie.app)',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ja,en;q=0.9',
          },
        })

        if (!response.ok) {
          return { error: `Failed to fetch recipe URL: ${response.status}` }
        }

        const html = await response.text()

        // Extract text content from HTML (basic extraction)
        // Remove script, style tags and HTML comments
        const cleanedHtml = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        // Limit content length to avoid token limits (keep first ~8000 chars)
        recipeText = `URL: ${data.input}\n\nContent:\n${cleanedHtml.slice(0, 8000)}`
      } catch (fetchError) {
        return {
          error: `Failed to fetch recipe URL: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
        }
      }
    }

    const prompt = generateRecipeAnalysisPrompt(recipeText, data.locale)

    const completion = await openai.chat.completions.create({
      model: MODELS.GPT5_NANO, // Fastest GPT-5 variant
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
  } catch (_error) {
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
  locale: 'en' | 'ja'
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

    const { recipe, version = 'original', locale } = data

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
        servings: Math.round(recipe.servings),
        prep_time: Math.round(recipe.prep_time),
        cook_time: Math.round(recipe.cook_time),
        calories_per_serving: Math.round(recipe.nutrition.calories),
        protein_per_serving: Math.round(recipe.nutrition.protein),
        carbs_per_serving: Math.round(recipe.nutrition.carbs),
        fats_per_serving: Math.round(recipe.nutrition.fats),
        tags,
        is_ai_generated: true,
        locale,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/meals')

    return { data: savedMeal }
  } catch (_error) {
    return { error: 'Failed to save recipe' }
  }
}
