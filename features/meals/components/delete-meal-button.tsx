'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { DeleteConfirmButton } from '@/components/molecules/delete-confirm-button'
import { deleteMeal } from '@/features/meals/actions'

interface DeleteMealButtonProps {
  mealId: string
  mealName: string
}

export function DeleteMealButton({ mealId, mealName }: DeleteMealButtonProps) {
  const router = useRouter()
  const t = useTranslations('meal_detail_page')
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMeal(mealId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(t('delete_success'))
        router.push('/meals')
      }
    })
  }

  return (
    <DeleteConfirmButton
      title={t('delete_meal')}
      description={t('delete_confirmation', { name: mealName })}
      cancelLabel={t('cancel')}
      deleteLabel={t('delete')}
      deletingLabel={t('deleting')}
      isPending={isPending}
      onDelete={handleDelete}
    />
  )
}
