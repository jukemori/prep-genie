'use client'

import { CheckCircle2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/atoms/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'
import { Input } from '@/components/atoms/ui/input'
import { Label } from '@/components/atoms/ui/label'
import { Separator } from '@/components/atoms/ui/separator'
import { register, signInWithGoogle } from '@/features/auth/actions'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const tConfirm = useTranslations('auth.confirmation')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await register(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success && result?.requiresConfirmation) {
      setSuccess(true)
      setEmail(result.email || '')
    }
    // If no error and no confirmation required, the action will redirect automatically
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError(null)

    const result = await signInWithGoogle()

    if (result?.error) {
      setError(result.error)
      setGoogleLoading(false)
    }
  }

  // Show success/confirmation page
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{tConfirm('title')}</CardTitle>
            <CardDescription>
              {tConfirm('description')}
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{tConfirm('next_steps')}</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>{tConfirm('step_1')}</li>
                    <li>{tConfirm('step_2')}</li>
                    <li>{tConfirm('step_3')}</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">{tConfirm('check_spam')}</p>
              <Button variant="outline" className="w-full" disabled>
                {tConfirm('resend')}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                {tConfirm('back_to_sign_in')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('email_placeholder')}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t('password_placeholder')}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t('confirm_password_placeholder')}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
              {loading ? t('creating_account') : t('create_account')}
            </Button>
          </form>

          <div className="relative my-4">
            <Separator />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              {t('or')}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              t('connecting')
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Google logo"
                >
                  <title>Google</title>
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('continue_with_google')}
              </>
            )}
          </Button>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t('have_account')}{' '}
            <Link href="/login" className="text-primary hover:underline">
              {t('sign_in')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
