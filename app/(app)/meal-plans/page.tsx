import { CalendarDays, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/atoms/ui/badge'
import { Button } from '@/components/atoms/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function MealPlansPage() {
  const supabase = await createClient()
  const t = await getTranslations('meal_plans_page')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/meal-plans/generate">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('generate_new')}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/meal-plans/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('create_manual')}
            </Link>
          </Button>
        </div>
      </div>

      {mealPlans && mealPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mealPlans.map((plan) => (
            <Card key={plan.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1">{plan.name}</CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {plan.type}
                  </Badge>
                </div>
                <CardDescription>
                  {plan.start_date && plan.end_date && (
                    <span>
                      {new Date(plan.start_date).toLocaleDateString()} -{' '}
                      {new Date(plan.end_date).toLocaleDateString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <div>
                    <p className="font-medium">{plan.total_calories || 0}</p>
                    <p className="text-xs text-muted-foreground">{t('calories')}</p>
                  </div>
                  <div>
                    <p className="font-medium">{plan.total_protein || 0}g</p>
                    <p className="text-xs text-muted-foreground">{t('protein')}</p>
                  </div>
                  <div>
                    <p className="font-medium">{plan.total_carbs || 0}g</p>
                    <p className="text-xs text-muted-foreground">{t('carbs')}</p>
                  </div>
                  <div>
                    <p className="font-medium">{plan.total_fats || 0}g</p>
                    <p className="text-xs text-muted-foreground">{t('fats')}</p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/meal-plans/${plan.id}`}>{t('view_plan')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t('no_plans_found')}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {t('create_first_plan')}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/meal-plans/generate">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('generate_new')}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/meal-plans/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('create_manual')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
