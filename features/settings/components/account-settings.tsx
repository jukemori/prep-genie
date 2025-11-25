'use client'

import type { User } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/atoms/ui/alert-dialog'
import { Button } from '@/components/atoms/ui/button'
import { Label } from '@/components/atoms/ui/label'
import { deleteAccount } from '../actions'

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const t = useTranslations('settings')
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteAccount() {
    setIsDeleting(true)
    try {
      const result = await deleteAccount()

      if (result.error) {
        toast.error(result.error)
        setIsDeleting(false)
      } else {
        toast.success(t('account_deleted_success'))
        // Redirect will happen via server action
      }
    } catch (_error) {
      toast.error(t('account_delete_failed'))
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">{t('email')}</Label>
        <p className="text-sm text-muted-foreground mb-2">{t('email_description')}</p>
        <p className="font-medium">{user.email}</p>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-base font-medium text-destructive mb-2">{t('danger_zone')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('danger_zone_description')}
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {t('delete_account')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('delete_account_confirm_title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('delete_account_confirm_description')}
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{t('delete_account_item_1')}</li>
                  <li>{t('delete_account_item_2')}</li>
                  <li>{t('delete_account_item_3')}</li>
                  <li>{t('delete_account_item_4')}</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? t('deleting') : t('delete_account_confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
