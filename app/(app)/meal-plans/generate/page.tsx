'use client'

import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Progress } from '@/components/atoms/ui/progress'
import { generateAIMealPlan } from '@/features/meal-plans/actions'

import { CuisineSelector } from '@/features/meal-plans/components/cuisine-selector'

export default function GenerateMealPlanPage() {
  const t = useTranslations('generate_meal_plan_page')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCuisine, setSelectedCuisine] = useState<
    'japanese' | 'korean' | 'mediterranean' | 'western' | 'halal' | undefined
  >(undefined)

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      // Generate and save in one action - returns meal plan ID
      const result = await generateAIMealPlan(selectedCuisine)

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        // Redirect to the newly created meal plan
        router.push(`/meal-plans/${result.data.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal plan')
    } finally {
      setLoading(false)
    }
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

      {!loading && (
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

            <Button onClick={handleGenerate} className="w-full" disabled={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {t('generate_button')}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <h3 className="mb-2 text-lg font-semibold">{t('generating_title')}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCuisine
                ? t('creating_cuisine_meals', { cuisine: selectedCuisine })
                : t('generating_wait')}
            </p>
            <div className="mt-4 w-full max-w-md">
              <Progress value={undefined} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="space-y-3 py-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-destructive"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-destructive">{t('error_occurred')}</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button onClick={handleGenerate} variant="outline" className="w-full" disabled={loading}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
