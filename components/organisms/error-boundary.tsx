'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/atoms/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
        </div>
        <CardDescription>
          An error occurred while loading this section. You can try again or contact support if the
          problem persists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm font-medium">Error details:</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button onClick={resetErrorBoundary} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (props: ErrorFallbackProps) => ReactNode
  onError?: (error: Error, errorInfo: { componentStack?: string | null }) => void
  onReset?: () => void
}

export function ErrorBoundary({ children, fallback, onError, onReset }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error, errorInfo) => {
        // Call custom error handler if provided
        onError?.(error, errorInfo)
      }}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  )
}
