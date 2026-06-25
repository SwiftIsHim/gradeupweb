import { cn } from "@/lib/utils"

/** Skeleton shown while the dashboard's onboarding data is being fetched. */
export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <Shimmer className="size-8 rounded-md" />
          <Shimmer className="h-5 w-24" />
        </div>
        <div className="flex-1 space-y-2 px-4 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <Shimmer className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-3.5 w-24" />
              <Shimmer className="h-3 w-16" />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3.5 sm:px-8">
          <Shimmer className="h-9 w-full rounded-full sm:max-w-md" />
          <div className="ml-auto flex items-center gap-3">
            <Shimmer className="size-9 rounded-full" />
            <Shimmer className="size-9 rounded-full" />
            <Shimmer className="h-7 w-28 rounded-full" />
          </div>
        </header>

        <main className="flex-1 px-6 py-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-6">
              <Shimmer className="h-48 w-full rounded-2xl" />
              <Shimmer className="h-40 w-full rounded-2xl" />
              <Shimmer className="h-56 w-full rounded-2xl" />
            </div>
            <div className="flex flex-col gap-6">
              <Shimmer className="h-60 w-full rounded-2xl" />
              <Shimmer className="h-48 w-full rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted", className)} />
}
