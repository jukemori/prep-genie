import { Skeleton } from '@/components/atoms/ui/skeleton'

export default function MealPlansLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`plan-${i}`} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-4 gap-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
