'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/atoms/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/ui/dialog'

interface DeleteConfirmButtonProps {
  title: string
  description: string
  cancelLabel: string
  deleteLabel: string
  deletingLabel: string
  isPending: boolean
  onDelete: () => void
}

export function DeleteConfirmButton({
  title,
  description,
  cancelLabel,
  deleteLabel,
  deletingLabel,
  isPending,
  onDelete,
}: DeleteConfirmButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleDelete() {
    onDelete()
  }

  return (
    <>
      <Button variant="destructive" size="icon" onClick={() => setIsOpen(true)} aria-label={title}>
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
              {cancelLabel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? deletingLabel : deleteLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
