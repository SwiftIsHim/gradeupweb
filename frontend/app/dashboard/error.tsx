"use client"

import { useEffect } from "react"
import { RotateCw, ServerCrash } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Error boundary for the dashboard. Most often this is a cold or unreachable
 * backend (the onboarding fetch failing), so we offer a retry rather than a
 * raw stack trace.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard failed to load:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ServerCrash className="size-7" />
        </div>
        <h1 className="mt-5 text-xl font-bold tracking-tight">
          We couldn&apos;t load your dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This usually means the server is starting up or temporarily
          unreachable. Give it a moment and try again.
        </p>
        <Button
          type="button"
          variant="brand"
          onClick={reset}
          className="mt-6 h-11 w-full rounded-full text-sm"
        >
          <RotateCw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  )
}
