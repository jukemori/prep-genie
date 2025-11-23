'use client'

import { Button } from '@/components/atoms/ui/button'
import { Label } from '@/components/atoms/ui/label'
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
import { toast } from 'sonner'
import { deleteAccount } from '../api/actions'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteAccount() {
    setIsDeleting(true)
    try {
      const result = await deleteAccount()

      if (result.error) {
        toast.error(result.error)
        setIsDeleting(false)
      } else {
        toast.success('Account deleted successfully')
        // Redirect will happen via server action
      }
    } catch (error) {
      toast.error('Failed to delete account')
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">Email</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Your registered email address
        </p>
        <p className="font-medium">{user.email}</p>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-base font-medium text-destructive mb-2">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Irreversible actions that affect your account
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                all your data from our servers, including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Your profile and personal information</li>
                  <li>All meal plans and saved meals</li>
                  <li>Grocery lists and progress logs</li>
                  <li>AI chat history</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
