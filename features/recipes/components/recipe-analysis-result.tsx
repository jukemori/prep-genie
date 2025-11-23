'use client'

import { Clock, DollarSign, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/atoms/ui/badge'
import { Button } from '@/components/atoms/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'
import { Separator } from '@/components/atoms/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/ui/tabs'
import { saveAnalyzedRecipe } from '../actions'

interface RecipeAnalysisResultProps {
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
    improvements: {
      budget: {
        description: string
        ingredient_swaps: Array<{
          original: string
          replacement: string
          savings: string
        }>
        estimated_savings: string
      }
      high_protein: {
        description: string
        ingredient_swaps: Array<{
          original: string
          replacement: string
          protein_boost: string
        }>
        new_protein: number
      }
      lower_calorie: {
        description: string
        ingredient_swaps: Array<{
          original: string
          replacement: string
          calorie_reduction: string
        }>
        new_calories: number
      }
    }
  }
  locale: 'en' | 'ja'
}

export function RecipeAnalysisResult({ recipe, locale }: RecipeAnalysisResultProps) {
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave(version: 'original' | 'budget' | 'high_protein' | 'lower_calorie') {
    setIsSaving(true)
    try {
      const result = await saveAnalyzedRecipe({
        recipe,
        version,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Recipe saved to your meal library!')
      }
    } catch (error) {
      toast.error('Failed to save recipe')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Recipe Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{recipe.name}</CardTitle>
          <CardDescription>{recipe.description}</CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {recipe.prep_time + recipe.cook_time} min
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {recipe.servings} servings
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => handleSave('original')} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Original Recipe'}
          </Button>
        </CardContent>
      </Card>

      {/* Nutrition Information */}
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Per Serving</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="text-2xl font-bold">{recipe.nutrition.calories}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="text-2xl font-bold">{recipe.nutrition.protein}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carbs</p>
              <p className="text-2xl font-bold">{recipe.nutrition.carbs}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fats</p>
              <p className="text-2xl font-bold">{recipe.nutrition.fats}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex justify-between">
                <span>{ingredient.name}</span>
                <span className="text-muted-foreground">
                  {ingredient.quantity} {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="text-sm">
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Improvements</CardTitle>
          <CardDescription>Three ways to optimize this recipe for different goals</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="budget">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="budget">
                <DollarSign className="h-4 w-4 mr-2" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="protein">
                <TrendingUp className="h-4 w-4 mr-2" />
                High Protein
              </TabsTrigger>
              <TabsTrigger value="calorie">
                <TrendingDown className="h-4 w-4 mr-2" />
                Lower Calorie
              </TabsTrigger>
            </TabsList>

            <TabsContent value="budget" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {recipe.improvements.budget.description}
              </p>
              <div className="space-y-2">
                {recipe.improvements.budget.ingredient_swaps.map((swap, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium line-through text-muted-foreground">
                        {swap.original}
                      </p>
                      <p className="text-sm font-medium">{swap.replacement}</p>
                    </div>
                    <Badge variant="secondary">{swap.savings}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="font-medium">Total Savings</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {recipe.improvements.budget.estimated_savings}
                </p>
              </div>
              <Button onClick={() => handleSave('budget')} disabled={isSaving} className="w-full">
                {isSaving ? 'Saving...' : 'Save Budget Version'}
              </Button>
            </TabsContent>

            <TabsContent value="protein" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {recipe.improvements.high_protein.description}
              </p>
              <div className="space-y-2">
                {recipe.improvements.high_protein.ingredient_swaps.map((swap, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium line-through text-muted-foreground">
                        {swap.original}
                      </p>
                      <p className="text-sm font-medium">{swap.replacement}</p>
                    </div>
                    <Badge variant="secondary">{swap.protein_boost}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="font-medium">New Protein Total</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {recipe.improvements.high_protein.new_protein}g per serving
                </p>
              </div>
              <Button
                onClick={() => handleSave('high_protein')}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save High-Protein Version'}
              </Button>
            </TabsContent>

            <TabsContent value="calorie" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {recipe.improvements.lower_calorie.description}
              </p>
              <div className="space-y-2">
                {recipe.improvements.lower_calorie.ingredient_swaps.map((swap, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium line-through text-muted-foreground">
                        {swap.original}
                      </p>
                      <p className="text-sm font-medium">{swap.replacement}</p>
                    </div>
                    <Badge variant="secondary">{swap.calorie_reduction}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="font-medium">New Calorie Total</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {recipe.improvements.lower_calorie.new_calories} kcal per serving
                </p>
              </div>
              <Button
                onClick={() => handleSave('lower_calorie')}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save Lower-Calorie Version'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
