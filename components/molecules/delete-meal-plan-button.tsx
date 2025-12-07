'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/atoms/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/ui/dialog'
import { deleteMealPlan } from '@/features/meal-plans/actions'

interface DeleteMealPlanButtonProps {
  mealPlanId: string
  mealPlanName: string
}

export function DeleteMealPlanButton({ mealPlanId, mealPlanName }: DeleteMealPlanButtonProps) {
  const router = useRouter()
  const t = useTranslations('meal_plan_detail_page')
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMealPlan(mealPlanId)
      if (result.error) {
        toast.error(result.error)
        setIsOpen(false)
      } else {
        toast.success(t('delete_success'))
        router.push('/meal-plans')
      }
    })
  }

  return (
    <>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label={t('delete_meal_plan')}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_meal_plan')}</DialogTitle>
            <DialogDescription>
              {t('delete_confirmation', { name: mealPlanName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
