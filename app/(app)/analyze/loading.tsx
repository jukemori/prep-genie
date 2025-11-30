import { Card, CardContent, CardHeader } from '@/components/atoms/ui/card'
import { Skeleton } from '@/components/atoms/ui/skeleton'

export default function AnalyzeLoading() {
  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-2 h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs */}
          <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <Skeleton className="h-9 rounded-md" />
            <Skeleton className="h-9 rounded-md" />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
