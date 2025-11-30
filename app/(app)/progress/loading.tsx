import { Card, CardContent, CardHeader } from '@/components/atoms/ui/card'
import { Skeleton } from '@/components/atoms/ui/skeleton'

export default function ProgressLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={`stat-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="mt-1 h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        {/* TabsList skeleton - 2 tabs */}
        <div className="inline-flex h-10 items-center gap-1 rounded-lg bg-muted p-1">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>

        {/* Tab content - Form Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`field-${i}`} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            {/* Notes textarea */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-24 w-full" />
            </div>
            {/* Submit button */}
            <Skeleton className="h-10 w-28" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
