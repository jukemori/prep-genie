import { ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { DeleteMealPlanButton } from '@/features/meal-plans/components/delete-meal-plan-button'
import { MealPlanItemCard } from '@/features/meal-plans/components/meal-plan-item-card'
import { createClient } from '@/lib/supabase/server'
import type { Meal, MealPlanItem } from '@/types'

interface MealPlanItemWithMeal extends MealPlanItem {
  meals: Meal
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MealPlanDetailPage({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations('meal_plan_detail_page')
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: mealPlan } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!mealPlan) {
    notFound()
  }

  const { data: items } = await supabase
    .from('meal_plan_items')
    .select('*, meals(*)')
    .eq('meal_plan_id', id)
    .order('day_of_week', { ascending: true })

  // Group by day
  const dayNames = [
    t('monday'),
    t('tuesday'),
    t('wednesday'),
    t('thursday'),
    t('friday'),
    t('saturday'),
    t('sunday'),
  ]
  const groupedByDay = items?.reduce(
    (acc: Record<number, MealPlanItemWithMeal[]>, item: MealPlanItemWithMeal) => {
      const day = item.day_of_week
      if (day !== null) {
        if (!acc[day]) {
          acc[day] = []
        }
        acc[day].push(item)
      }
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/meal-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back_to_meal_plans')}
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/grocery-lists/generate?mealPlanId=${id}`}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t('generate_grocery_list')}
            </Link>
          </Button>
          <DeleteMealPlanButton mealPlanId={id} mealPlanName={mealPlan.name} />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{mealPlan.name}</h1>
        {mealPlan.start_date && mealPlan.end_date && (
          <p className="text-muted-foreground">
            {new Date(mealPlan.start_date).toLocaleDateString()} -{' '}
            {new Date(mealPlan.end_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{mealPlan.total_calories || 0}</p>
            <p className="text-sm text-muted-foreground">{t('total_calories')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{mealPlan.total_protein || 0}g</p>
            <p className="text-sm text-muted-foreground">{t('protein')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{mealPlan.total_carbs || 0}g</p>
            <p className="text-sm text-muted-foreground">{t('carbs')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{mealPlan.total_fats || 0}g</p>
            <p className="text-sm text-muted-foreground">{t('fats')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Days */}
      {groupedByDay &&
        Object.keys(groupedByDay)
          .sort()
          .map((day: string) => (
            <Card key={day} data-testid="day-card">
              <CardHeader>
                <CardTitle>{dayNames[Number(day)]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedByDay[Number(day)].map((item: MealPlanItemWithMeal) => (
                  <MealPlanItemCard key={item.id} item={item} mealPlanId={id} />
                ))}
              </CardContent>
            </Card>
          ))}
    </div>
  )
}
