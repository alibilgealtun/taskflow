import { Skeleton } from '@/components/ui/skeleton';

export default function ShareLoading() {
  return (
    <div className="min-h-screen bg-surface-bg px-4 py-8 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((column) => (
            <div
              key={column}
              className="min-h-28 space-y-4 rounded-2xl border border-surface-border bg-surface-elevated/45 p-3 lg:min-h-80"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
