import { Apple, CalendarDays, Flame, Target, TrendingUp, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/atoms/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'
import { Progress } from '@/components/atoms/ui/progress'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const t = await getTranslations('dashboard')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recent meals count
  const { count: mealsCount } = await supabase
    .from('meals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch active meal plans count
  const { count: mealPlansCount } = await supabase
    .from('meal_plans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch today's progress (if exists)
  const today = new Date().toISOString().split('T')[0]
  const { data: todayProgress } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', today)
    .single()

  const caloriesProgress = todayProgress
    ? (todayProgress.calories_consumed / (profile?.daily_calorie_target || 2000)) * 100
    : 0

  const proteinProgress = todayProgress
    ? (todayProgress.protein_consumed / (profile?.target_protein || 150)) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('welcome_back')}</h1>
        <p className="text-muted-foreground">{t('overview')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('daily_calories')}</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayProgress?.calories_consumed || 0}/{profile?.daily_calorie_target || 0}
            </div>
            <Progress value={caloriesProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('protein_target')}</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayProgress?.protein_consumed || 0}g/{profile?.target_protein || 0}g
            </div>
            <Progress value={proteinProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('saved_meals')}</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('recipes_in_library')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('active_plans')}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealPlansCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('meal_plans_created')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Nutrition Goals */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('nutrition_goals')}</CardTitle>
            <CardDescription>{t('based_on_profile')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('goal')}</span>
              <span className="text-sm text-muted-foreground capitalize">
                {profile?.goal
                  ? t(
                      `goal_${profile.goal}` as
                        | 'goal_weight_loss'
                        | 'goal_maintain'
                        | 'goal_muscle_gain'
                        | 'goal_balanced'
                    )
                  : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('tdee')}</span>
              <span className="text-sm text-muted-foreground">{profile?.tdee} kcal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('daily_target')}</span>
              <span className="text-sm text-muted-foreground">
                {profile?.daily_calorie_target} kcal
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>
                  {t('protein')}: {profile?.target_protein}g
                </span>
                <span>
                  {t('carbs')}: {profile?.target_carbs}g
                </span>
                <span>
                  {t('fats')}: {profile?.target_fats}g
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('quick_actions')}</CardTitle>
            <CardDescription>{t('what_today')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/meal-plans/generate">
                <Target className="mr-2 h-4 w-4" />
                {t('generate_meal_plan')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/meals">
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                {t('browse_meals')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/progress">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('log_progress')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
