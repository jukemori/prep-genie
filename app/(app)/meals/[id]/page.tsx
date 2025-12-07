import { ArrowLeft, Clock, Edit, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/atoms/ui/badge'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Separator } from '@/components/atoms/ui/separator'
import { FavoriteButton } from '@/components/molecules/favorite-button'
import { IngredientItem } from '@/components/molecules/ingredient-item'
import { MacroDisplay } from '@/components/molecules/macro-display'
import { checkMealIsSaved } from '@/features/meals/actions'
import { DeleteMealButton } from '@/features/meals/components/delete-meal-button'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MealDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const t = await getTranslations('meal_detail_page')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: meal } = await supabase.from('meals').select('*').eq('id', id).single()

  if (!meal) {
    notFound()
  }

  // Check access
  if (meal.user_id !== user.id && !meal.is_public) {
    notFound()
  }

  const isOwner = meal.user_id === user.id
  const totalTime = (meal.prep_time || 0) + (meal.cook_time || 0)
  const { isSaved } = await checkMealIsSaved(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/meals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back_to_meals')}
          </Link>
        </Button>
        <div className="flex gap-2">
          <FavoriteButton mealId={id} initialIsSaved={isSaved} />
          {isOwner && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/meals/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('edit')}
                </Link>
              </Button>
              <DeleteMealButton mealId={id} mealName={meal.name} />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          {meal.image_url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image src={meal.image_url} alt={meal.name} fill className="object-cover" />
            </div>
          )}

          <div>
            <div className="mb-2 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold">{meal.name}</h1>
              {meal.difficulty_level && (
                <Badge className="capitalize">{meal.difficulty_level}</Badge>
              )}
            </div>
            {meal.description && <p className="text-muted-foreground">{meal.description}</p>}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {totalTime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {totalTime} {t('min_total')}
                  </span>
                </div>
              )}
              {meal.servings && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {meal.servings} {t('servings')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>{t('ingredients')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? (
                meal.ingredients.map(
                  (
                    ingredient: { name: string; quantity: number; unit: string; category?: string },
                    index: number
                  ) => (
                    <IngredientItem
                      key={`${ingredient.name}-${index}`}
                      ingredient={ingredient}
                      showCategory
                    />
                  )
                )
              ) : (
                <p className="text-sm text-muted-foreground">{t('no_ingredients')}</p>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('instructions')}</CardTitle>
            </CardHeader>
            <CardContent>
              {meal.instructions && meal.instructions.length > 0 ? (
                <ol className="space-y-3">
                  {meal.instructions.map((step: string, index: number) => (
                    <li key={`${step.slice(0, 20)}-${index}`} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                      <p className="flex-1 pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">{t('no_instructions')}</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {meal.tags && meal.tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">{t('tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {meal.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nutrition */}
          <Card>
            <CardHeader>
              <CardTitle>{t('nutrition_per_serving')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-3xl font-bold">{meal.calories_per_serving || 0}</p>
                <p className="text-sm text-muted-foreground">{t('calories')}</p>
              </div>
              <MacroDisplay
                protein={meal.protein_per_serving || 0}
                carbs={meal.carbs_per_serving || 0}
                fats={meal.fats_per_serving || 0}
              />
            </CardContent>
          </Card>

          {/* Meal Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('meal_info')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {meal.cuisine_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cuisine')}</span>
                  <span className="capitalize font-medium">{meal.cuisine_type}</span>
                </div>
              )}
              {meal.meal_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('type')}</span>
                  <span className="capitalize font-medium">{meal.meal_type}</span>
                </div>
              )}
              {meal.prep_time && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('prep_time')}</span>
                  <span className="font-medium">
                    {meal.prep_time} {t('min')}
                  </span>
                </div>
              )}
              {meal.cook_time && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cook_time')}</span>
                  <span className="font-medium">
                    {meal.cook_time} {t('min')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meal Prep Info */}
          {(meal.meal_prep_friendly ||
            meal.storage_instructions ||
            meal.reheating_instructions ||
            meal.storage_duration_days ||
            meal.container_type ||
            meal.batch_cooking_multiplier) && (
            <Card>
              <CardHeader>
                <CardTitle>{t('meal_prep_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {meal.meal_prep_friendly && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {t('meal_prep_friendly')}
                    </Badge>
                  </div>
                )}
                {meal.batch_cooking_multiplier && meal.batch_cooking_multiplier > 1 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('batch_multiplier')}</span>
                    <span className="font-medium">{meal.batch_cooking_multiplier}x</span>
                  </div>
                )}
                {meal.storage_duration_days && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('storage_duration')}</span>
                    <span className="font-medium">
                      {meal.storage_duration_days} {t('days')}
                    </span>
                  </div>
                )}
                {meal.container_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('container_type')}</span>
                    <span className="capitalize font-medium">{meal.container_type}</span>
                  </div>
                )}
                {meal.storage_instructions && (
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">
                      {t('storage_instructions')}
                    </span>
                    <p className="text-foreground">{meal.storage_instructions}</p>
                  </div>
                )}
                {meal.reheating_instructions && (
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">
                      {t('reheating_instructions')}
                    </span>
                    <p className="text-foreground">{meal.reheating_instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
