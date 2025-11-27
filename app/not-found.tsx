import { ChefHat, Home } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/atoms/ui/button'

export const metadata: Metadata = {
  title: '404 - Page Not Found | PrepGenie',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <ChefHat className="h-12 w-12 text-primary" />
            <span className="text-3xl font-bold">PrepGenie</span>
          </div>
        </div>

        {/* 404 Message */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3 pt-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">
              <Home className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/meals">Browse Meals</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
