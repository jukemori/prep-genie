'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/atoms/ui/button'
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
import { Textarea } from '@/components/atoms/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/ui/tabs'
import { toast } from 'sonner'
import { analyzeRecipe } from '../api/actions'
import { RecipeAnalysisResult } from './recipe-analysis-result'
import { Loader2 } from 'lucide-react'

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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedRecipe, setAnalyzedRecipe] = useState<AnalyzedRecipe | null>(null)
  const [inputType, setInputType] = useState<'url' | 'text'>('url')

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      input: '',
    },
  })

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
        toast.success('Recipe analyzed successfully!')
      }
    } catch (error) {
      toast.error('Failed to analyze recipe')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={inputType} onValueChange={(v) => setInputType(v as 'url' | 'text')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">Recipe URL</TabsTrigger>
          <TabsTrigger value="text">Recipe Text</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/recipe"
                        {...field}
                        disabled={isAnalyzing}
                      />
                    </FormControl>
                    <FormDescription>
                      Paste a link to any online recipe
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Recipe'}
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
                    <FormLabel>Recipe Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full recipe here (ingredients and instructions)..."
                        className="min-h-[200px]"
                        {...field}
                        disabled={isAnalyzing}
                      />
                    </FormControl>
                    <FormDescription>
                      Include ingredient list and cooking instructions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Recipe'}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>

      {analyzedRecipe && (
        <RecipeAnalysisResult recipe={analyzedRecipe} locale={locale} />
      )}
    </div>
  )
}
