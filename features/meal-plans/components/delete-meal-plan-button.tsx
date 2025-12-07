'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { DeleteConfirmButton } from '@/components/molecules/delete-confirm-button'
import { deleteMealPlan } from '@/features/meal-plans/actions'

interface DeleteMealPlanButtonProps {
  mealPlanId: string
  mealPlanName: string
}

export function DeleteMealPlanButton({ mealPlanId, mealPlanName }: DeleteMealPlanButtonProps) {
  const router = useRouter()
  const t = useTranslations('meal_plan_detail_page')
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMealPlan(mealPlanId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(t('delete_success'))
        router.push('/meal-plans')
      }
    })
  }

  return (
    <DeleteConfirmButton
      title={t('delete_meal_plan')}
      description={t('delete_confirmation', { name: mealPlanName })}
      cancelLabel={t('cancel')}
      deleteLabel={t('delete')}
      deletingLabel={t('deleting')}
      isPending={isPending}
      onDelete={handleDelete}
    />
  )
}
