'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/atoms/ui/button'
import { Card, CardContent } from '@/components/atoms/ui/card'

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js error boundary requires this name
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardContent className="flex flex-col items-center space-y-4 pt-6 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              We encountered an error while loading this page. Please try again.
            </p>
            {error.digest && (
              <p className="font-mono text-xs text-muted-foreground">Error ID: {error.digest}</p>
            )}
          </div>
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
