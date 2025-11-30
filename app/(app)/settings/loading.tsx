import { Skeleton } from '@/components/atoms/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`section-${i}`} className="rounded-lg border">
          <div className="border-b p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
