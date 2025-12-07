import { Skeleton } from '@/components/atoms/ui/skeleton'

export default function GroceryListDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>

      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`category-${i}`} className="rounded-lg border">
          <div className="border-b p-4">
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={`item-${i}-${j}`} className="flex items-center gap-3 rounded-lg border p-3">
                <Skeleton className="h-5 w-5" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
