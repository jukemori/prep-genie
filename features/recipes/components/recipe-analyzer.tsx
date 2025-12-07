'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/atoms/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/atoms/ui/form'
import { Input } from '@/components/atoms/ui/input'
import { Skeleton } from '@/components/atoms/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/ui/tabs'
import { Textarea } from '@/components/atoms/ui/textarea'
import { analyzeRecipe } from '../actions'
import { RecipeAnalysisResult } from './recipe-analysis-result'

const recipeSchema = z.object({
  input: z.string().min(10, 'Recipe input must be at least 10 characters'),
})

type RecipeFormValues = z.infer<typeof recipeSchema>

interface RecipeAnalyzerProps {
  locale: 'en' | 'ja'
}

interface AnalyzedRecipe {
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

export function RecipeAnalyzer({ locale }: RecipeAnalyzerProps) {
  const t = useTranslations('analyze_page')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedRecipe, setAnalyzedRecipe] = useState<AnalyzedRecipe | null>(null)
  const [inputType, setInputType] = useState<'url' | 'text'>('url')
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      input: '',
    },
  })

  // Animate through steps while analyzing
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0)
      return
    }

    const stepTimings = [0, 5000, 12000] // Step 1 immediately, Step 2 at 5s, Step 3 at 12s
    const timers: NodeJS.Timeout[] = []

    stepTimings.forEach((delay, index) => {
      const timer = setTimeout(() => {
        setCurrentStep(index + 1)
      }, delay)
      timers.push(timer)
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [isAnalyzing])

  async function onSubmit(data: RecipeFormValues) {
    setIsAnalyzing(true)
    setAnalyzedRecipe(null)

    try {
      const result = await analyzeRecipe({
        input: data.input,
        inputType,
        locale,
      })

      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setAnalyzedRecipe(result.data)
        toast.success(t('analyze_success'))
      }
    } catch (_error) {
      toast.error(t('analyze_error'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const steps = [
    { key: 'step1', label: t('analyzing_step1') },
    { key: 'step2', label: t('analyzing_step2') },
    { key: 'step3', label: t('analyzing_step3') },
  ]

  return (
    <div className="space-y-6">
      <Tabs value={inputType} onValueChange={(v) => setInputType(v as 'url' | 'text')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">{t('tab_url')}</TabsTrigger>
          <TabsTrigger value="text">{t('tab_text')}</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('url_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('url_placeholder')} {...field} disabled={isAnalyzing} />
                    </FormControl>
                    <FormDescription>{t('url_description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzing ? t('analyzing') : t('analyze')}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="text">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('text_label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('text_placeholder')}
                        className="min-h-[200px]"
                        {...field}
                        disabled={isAnalyzing}
                      />
                    </FormControl>
                    <FormDescription>{t('text_description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzing ? t('analyzing') : t('analyze')}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>

      {/* Analyzing Loading State */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('analyzing_title')}
            </CardTitle>
            <CardDescription>{t('analyzing_note')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const stepNumber = index + 1
                const isCompleted = currentStep > stepNumber
                const isActive = currentStep === stepNumber

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span
                      className={
                        isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : isActive
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground'
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Skeleton Preview */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analyzedRecipe && <RecipeAnalysisResult recipe={analyzedRecipe} locale={locale} />}
    </div>
  )
}
