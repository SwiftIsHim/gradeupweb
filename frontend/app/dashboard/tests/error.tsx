"use client"

import * as Sentry from "@sentry/nextjs"
import Link from "next/link"
import { useEffect } from "react"
import { RotateCw, ServerCrash } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Error boundary scoped to /dashboard/tests. Keeps a crash mid-test (or in the
 * hub) from blanking the rest of the dashboard shell.
 */
export default function TestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ServerCrash className="size-7" />
        </div>
        <h1 className="mt-5 text-xl font-bold tracking-tight">
          Something went wrong with this test
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your progress on this attempt may not be saved. Try again, or head
          back to the tests hub.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="brand"
            onClick={reset}
            className="h-11 flex-1 rounded-full text-sm"
          >
            <RotateCw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="h-11 flex-1 rounded-full text-sm">
            <Link href="/dashboard/tests">Back to tests</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
