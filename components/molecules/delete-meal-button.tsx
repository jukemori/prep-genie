'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/atoms/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/ui/dialog'
import { deleteMeal } from '@/features/meals/actions'
import { toast } from 'sonner'

interface DeleteMealButtonProps {
  mealId: string
  mealName: string
}

export function DeleteMealButton({ mealId, mealName }: DeleteMealButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMeal(mealId)
      if (result.error) {
        toast.error(result.error)
        setIsOpen(false)
      } else {
        toast.success('Meal deleted successfully')
        router.push('/meals')
      }
    })
  }

  return (
    <>
      <Button variant="destructive" size="icon" onClick={() => setIsOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{mealName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
