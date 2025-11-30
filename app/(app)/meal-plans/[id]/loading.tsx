import { Skeleton } from '@/components/atoms/ui/skeleton'

export default function MealPlanDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="rounded-lg border p-6 text-center">
            <Skeleton className="mx-auto h-8 w-16" />
            <Skeleton className="mx-auto mt-2 h-4 w-20" />
          </div>
        ))}
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`day-${i}`} className="rounded-lg border">
          <div className="border-b p-4">
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={`meal-${i}-${j}`} className="h-20 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
