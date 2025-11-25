'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/atoms/ui/badge'
import { Checkbox } from '@/components/atoms/ui/checkbox'
import type { Meal, MealPlanItem } from '@/types'
import { toggleMealCompleted } from '../actions'
import { MealSwapMenu } from './meal-swap-menu'

interface MealPlanItemWithMeal extends MealPlanItem {
  meals: Meal
}

interface MealPlanItemCardProps {
  item: MealPlanItemWithMeal
  mealPlanId: string
  onSwapComplete?: () => void
}

export function MealPlanItemCard({ item, mealPlanId, onSwapComplete }: MealPlanItemCardProps) {
  const t = useTranslations('meal_plan_detail_page')
  const tMeals = useTranslations('meals')
  const [isCompleted, setIsCompleted] = useState(item.is_completed || false)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleToggleCompleted() {
    setIsUpdating(true)
    try {
      const result = await toggleMealCompleted(item.id, !isCompleted)

      if (result.error) {
        toast.error(result.error)
      } else {
        setIsCompleted(!isCompleted)
      }
    } catch (_error) {
      toast.error(t('meal_status_update_failed'))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggleCompleted}
        disabled={isUpdating}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link href={`/meals/${item.meal_id}`} className="font-semibold hover:underline">
              {item.meals.name}
            </Link>
            {item.meals.description && (
              <p className="text-sm text-muted-foreground">{item.meals.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className="capitalize">{tMeals(item.meal_time as 'breakfast' | 'lunch' | 'dinner' | 'snack')}</Badge>
            {isCompleted && (
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                {t('done')}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{item.meals.calories_per_serving || 0} cal</span>
          <span>{item.meals.protein_per_serving || 0}g protein</span>
          <span>{item.meals.carbs_per_serving || 0}g carbs</span>
          <span>{item.meals.fats_per_serving || 0}g fats</span>
        </div>
        <div className="mt-3">
          <MealSwapMenu
            mealPlanId={mealPlanId}
            mealPlanItemId={item.id}
            mealName={item.meals.name}
            onSwapComplete={onSwapComplete}
          />
        </div>
      </div>
    </div>
  )
}
