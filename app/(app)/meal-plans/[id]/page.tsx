import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card'
import { Badge } from '@/components/atoms/ui/badge'
import { Checkbox } from '@/components/atoms/ui/checkbox'
import { ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MealPlanDetailPage({ params }: PageProps) {
  const { id } = await params
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
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const groupedByDay = items?.reduce((acc: any, item: any) => {
    const day = item.day_of_week
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/meal-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meal Plans
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/grocery-lists/generate?mealPlanId=${id}`}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Generate Grocery List
            </Link>
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
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
            <p className="text-sm text-muted-foreground">Total Calories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{mealPlan.total_protein || 0}g</p>
            <p className="text-sm text-muted-foreground">Protein</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{mealPlan.total_carbs || 0}g</p>
            <p className="text-sm text-muted-foreground">Carbs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{mealPlan.total_fats || 0}g</p>
            <p className="text-sm text-muted-foreground">Fats</p>
          </CardContent>
        </Card>
      </div>

      {/* Days */}
      {groupedByDay && Object.keys(groupedByDay).sort().map((day: any) => (
        <Card key={day}>
          <CardHeader>
            <CardTitle>{dayNames[day]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupedByDay[day].map((item: any) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border p-4"
              >
                <Checkbox />
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/meals/${item.meal_id}`}
                        className="font-semibold hover:underline"
                      >
                        {item.meals.name}
                      </Link>
                      {item.meals.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.meals.description}
                        </p>
                      )}
                    </div>
                    <Badge className="capitalize">{item.meal_time}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{item.meals.calories_per_serving || 0} cal</span>
                    <span>{item.meals.protein_per_serving || 0}g protein</span>
                    <span>{item.meals.carbs_per_serving || 0}g carbs</span>
                    <span>{item.meals.fats_per_serving || 0}g fats</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
