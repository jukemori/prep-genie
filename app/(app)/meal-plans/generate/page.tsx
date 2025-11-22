'use client'

import { useState } from 'react'
import { generateAIMealPlan, saveMealPlan } from '@/features/meal-plans/api/actions'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Progress } from '@/components/atoms/ui/progress'
import { Badge } from '@/components/atoms/ui/badge'
import { Sparkles, ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { readStreamableValue } from 'ai/rsc'

export default function GenerateMealPlanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setGenerating(true)
    setError(null)
    setGeneratedPlan('')

    try {
      const { stream } = await generateAIMealPlan()
      let fullContent = ''

      for await (const chunk of readStreamableValue(stream)) {
        if (chunk) {
          fullContent += chunk
          setGeneratedPlan(fullContent)
        }
      }

      setGenerating(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal plan')
      setGenerating(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!generatedPlan) return

    setSaving(true)
    setError(null)

    const result = await saveMealPlan(generatedPlan)

    if (result.error) {
      setError(result.error)
      setSaving(false)
    } else if (result.data) {
      router.push(`/meal-plans/${result.data.id}`)
    }
  }

  let parsedPlan = null
  try {
    if (generatedPlan && !generating) {
      parsedPlan = JSON.parse(generatedPlan)
    }
  } catch {
    // Still generating or invalid JSON
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/meal-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meal Plans
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">AI Meal Plan Generator</h1>
        <p className="text-muted-foreground">
          Generate a personalized weekly meal plan based on your profile and nutrition goals
        </p>
      </div>

      {!loading && !generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Generate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our AI will create a customized 7-day meal plan tailored to your:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Calorie and macro targets</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Dietary preferences and restrictions</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Cooking skill level and time availability</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Budget and ingredient preferences</span>
              </li>
            </ul>
            <Button onClick={handleGenerate} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Meal Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {(loading || generating) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <h3 className="mb-2 text-lg font-semibold">Generating Your Meal Plan</h3>
            <p className="text-sm text-muted-foreground">
              This may take a minute...
            </p>
            {generating && (
              <div className="mt-4 w-full max-w-md">
                <Progress value={undefined} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {parsedPlan && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated Meal Plan</CardTitle>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Plan
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {parsedPlan.week_summary.total_calories}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Calories</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {parsedPlan.week_summary.total_protein}g
                  </p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {parsedPlan.week_summary.total_carbs}g
                  </p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {parsedPlan.week_summary.total_fats}g
                  </p>
                  <p className="text-xs text-muted-foreground">Fats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {parsedPlan.meal_plan.map((day: any) => (
            <Card key={day.day}>
              <CardHeader>
                <CardTitle>
                  Day {day.day} - {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day.day - 1]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {day.meals.map((meal: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{meal.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {meal.description}
                        </p>
                      </div>
                      <Badge className="capitalize">{meal.meal_type}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{meal.nutrition_per_serving.calories} cal</span>
                      <span>{meal.nutrition_per_serving.protein}g protein</span>
                      <span>{meal.nutrition_per_serving.carbs}g carbs</span>
                      <span>{meal.nutrition_per_serving.fats}g fats</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
