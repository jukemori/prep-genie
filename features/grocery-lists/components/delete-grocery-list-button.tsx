'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { DeleteConfirmButton } from '@/components/molecules/delete-confirm-button'
import { deleteGroceryList } from '@/features/grocery-lists/actions'

interface DeleteGroceryListButtonProps {
  groceryListId: string
  groceryListName: string
}

export function DeleteGroceryListButton({
  groceryListId,
  groceryListName,
}: DeleteGroceryListButtonProps) {
  const router = useRouter()
  const t = useTranslations('grocery_list_detail_page')
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteGroceryList(groceryListId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(t('delete_success'))
        router.push('/grocery-lists')
      }
    })
  }

  return (
    <DeleteConfirmButton
      title={t('delete_grocery_list')}
      description={t('delete_confirmation', { name: groceryListName })}
      cancelLabel={t('cancel')}
      deleteLabel={t('delete')}
      deletingLabel={t('deleting')}
      isPending={isPending}
      onDelete={handleDelete}
    />
  )
}
