import { Skeleton } from '@/components/atoms/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="rounded-lg border p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-6">
          <Skeleton className="h-6 w-32" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`item-${i}`} className="h-16 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-48 w-full" />
        </div>
      </div>
    </div>
  )
}
