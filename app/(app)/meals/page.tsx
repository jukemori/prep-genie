import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/atoms/ui/button'
import { MealCard } from '@/components/molecules/meal-card'
import { MealFilters } from '@/features/meals/components/meal-filters'
import { createClient } from '@/lib/supabase/server'
import type { Meal } from '@/types'

interface PageProps {
  searchParams: Promise<{
    search?: string
    cuisine?: string
    mealType?: string
    tag?: string
  }>
}

export default async function MealsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Build query
  let query = supabase
    .from('meals')
    .select('*')
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: false })

  // Apply filters
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  if (params.cuisine) {
    query = query.eq('cuisine_type', params.cuisine)
  }

  if (params.mealType) {
    query = query.eq('meal_type', params.mealType)
  }

  if (params.tag) {
    query = query.contains('tags', [params.tag])
  }

  const { data: meals } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meal Library</h1>
          <p className="text-muted-foreground">Browse and manage your meal collection</p>
        </div>
        <Button asChild>
          <Link href="/meals/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Meal
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <MealFilters
        defaultSearch={params.search}
        defaultCuisine={params.cuisine}
        defaultMealType={params.mealType}
        defaultTag={params.tag}
      />

      {/* Meals Grid */}
      {meals && meals.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal as Meal} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No meals found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {params.search || params.tag
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first meal'}
          </p>
          <Button asChild>
            <Link href="/meals/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Meal
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
