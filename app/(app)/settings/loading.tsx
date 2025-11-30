import { Card, CardContent, CardHeader } from '@/components/atoms/ui/card'
import { Skeleton } from '@/components/atoms/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        {/* TabsList skeleton - 5 tabs */}
        <div className="grid w-full grid-cols-5 gap-1 rounded-lg bg-muted p-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`tab-${i}`} className="h-9 rounded-md" />
          ))}
        </div>

        {/* Tab content - Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Form fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`field-${i}`} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            {/* Save button */}
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
