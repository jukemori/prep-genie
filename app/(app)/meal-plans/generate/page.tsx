'use client'

import { ArrowLeft, Loader2, Save, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useDeferredValue, useState, useTransition } from 'react'
import { Badge } from '@/components/atoms/ui/badge'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Progress } from '@/components/atoms/ui/progress'
import { generateAIMealPlan, saveMealPlan } from '@/features/meal-plans/actions'

import { CuisineSelector } from '@/features/meal-plans/components/cuisine-selector'

interface GeneratedMeal {
  name: string
  description: string
  meal_type: string
  nutrition_per_serving: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
}

import { readStreamableValue } from '@ai-sdk/rsc'

export default function GenerateMealPlanPage() {
  const t = useTranslations('generate_meal_plan_page')
  const router = useRouter()
  const [_isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<string>('')
  const deferredPlan = useDeferredValue(generatedPlan)
  const [error, setError] = useState<string | null>(null)
  const [selectedCuisine, setSelectedCuisine] = useState<
    'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal' | undefined
  >(undefined)

  async function handleGenerate() {
    setLoading(true)
    setGenerating(true)
    setError(null)
    setGeneratedPlan('')

    try {
      const { stream } = await generateAIMealPlan(selectedCuisine)
      let fullContent = ''
      let lastUpdateTime = Date.now()
      // Increased to 1000ms (1 second) to drastically reduce re-renders
      // This reduces ~3200 chunks to ~50-60 updates over 50-60 seconds
      const UPDATE_INTERVAL_MS = 1000

      for await (const chunk of readStreamableValue(stream)) {
        if (chunk) {
          fullContent += chunk

          // Throttle + startTransition + useDeferredValue to prevent stack overflow:
          // 1. Throttle: Only update every 1 second (reduces ~3200 chunks to ~50-60 updates)
          // 2. startTransition: Mark updates as non-urgent/lower-priority
          // 3. useDeferredValue: Defer value changes to prevent immediate re-renders
          const now = Date.now()
          if (now - lastUpdateTime >= UPDATE_INTERVAL_MS) {
            startTransition(() => {
              setGeneratedPlan(fullContent)
            })
            lastUpdateTime = now
          }
        }
      }

      // Final update with complete content (also wrapped in startTransition)
      startTransition(() => {
        setGeneratedPlan(fullContent)
      })
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
    // Use deferredPlan for rendering to reduce re-renders
    if (deferredPlan && !generating) {
      parsedPlan = JSON.parse(deferredPlan)
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
            {t('back_to_meal_plans')}
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {!loading && !generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>{t('ready_to_generate')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('ai_will_create')}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{t('calorie_macro_targets')}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{t('dietary_preferences')}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{t('cooking_skill_time')}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{t('budget_ingredients')}</span>
              </li>
            </ul>

            {/* Cuisine Type Selector */}
            <div className="space-y-2 border-t pt-4">
              <label htmlFor="cuisine" className="text-sm font-medium">
                {t('cuisine_type_optional')}
              </label>
              <p className="text-xs text-muted-foreground">
                {t('cuisine_type_description')}
              </p>
              <CuisineSelector value={selectedCuisine} onValueChange={setSelectedCuisine} />
            </div>

            <Button onClick={handleGenerate} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('generate_button')}
            </Button>
          </CardContent>
        </Card>
      )}

      {(loading || generating) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <h3 className="mb-2 text-lg font-semibold">{t('generating_title')}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCuisine
                ? t('creating_cuisine_meals', { cuisine: selectedCuisine })
                : t('generating_wait')}
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
              <CardTitle>{t('generated_meal_plan')}</CardTitle>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {t('save_plan')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{parsedPlan.week_summary.total_calories}</p>
                  <p className="text-xs text-muted-foreground">{t('total_calories')}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{parsedPlan.week_summary.total_protein}g</p>
                  <p className="text-xs text-muted-foreground">{t('protein')}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{parsedPlan.week_summary.total_carbs}g</p>
                  <p className="text-xs text-muted-foreground">{t('carbs')}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{parsedPlan.week_summary.total_fats}g</p>
                  <p className="text-xs text-muted-foreground">{t('fats')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {parsedPlan.meal_plan.map((day: { day: number; meals: GeneratedMeal[] }) => {
            const dayNames = [
              t('monday'),
              t('tuesday'),
              t('wednesday'),
              t('thursday'),
              t('friday'),
              t('saturday'),
              t('sunday')
            ]
            return (
              <Card key={day.day}>
                <CardHeader>
                  <CardTitle>
                    {t('day_number', { day: day.day })} - {dayNames[day.day - 1]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {day.meals.map((meal: GeneratedMeal) => (
                    <div key={meal.name} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{meal.name}</h4>
                          <p className="text-sm text-muted-foreground">{meal.description}</p>
                        </div>
                        <Badge className="capitalize">{meal.meal_type}</Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{meal.nutrition_per_serving.calories} {t('cal')}</span>
                        <span>{meal.nutrition_per_serving.protein}g {t('protein')}</span>
                        <span>{meal.nutrition_per_serving.carbs}g {t('carbs')}</span>
                        <span>{meal.nutrition_per_serving.fats}g {t('fats')}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
    </div>
  )
}
