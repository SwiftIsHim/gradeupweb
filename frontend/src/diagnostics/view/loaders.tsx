"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { loadDiagnosticContent } from "@/src/diagnostics/data/loadDiagnostics"
import { submitDiagnosticAttemptClient } from "@/src/diagnostics/data/attemptsClient"
import { TestRunner } from "@/src/tests/view/test-runner"
import type { TestContent } from "@/src/tests/model/tests"

/**
 * Client loader for the Diagnostic Test take page. Reuses the Tests section's
 * runner (timer, question navigator, inline results) — the content shape and
 * UX are identical, only where attempts are submitted differs.
 */

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "notFound" }
  | { status: "ready"; data: TestContent }

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
      {children}
    </div>
  )
}

export function DiagnosticRunnerLoader() {
  const [state, setState] = useState<LoadState>({ status: "loading" })

  useEffect(() => {
    let cancelled = false
    loadDiagnosticContent()
      .then((data) => {
        if (cancelled) return
        setState(
          data === null ? { status: "notFound" } : { status: "ready", data },
        )
      })
      .catch((error) => {
        if (cancelled) return
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Something went wrong.",
        })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === "loading") {
    return (
      <Centered>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </span>
      </Centered>
    )
  }

  if (state.status === "error") {
    return (
      <Centered>
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.message}
        </p>
      </Centered>
    )
  }

  if (state.status === "notFound") {
    return (
      <Centered>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The diagnostic test isn’t available yet.
          </p>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            Back to home
          </Link>
        </div>
      </Centered>
    )
  }

  return (
    <TestRunner
      test={state.data}
      backHref="/dashboard"
      backLabel="Back to home"
      submitAttempt={submitDiagnosticAttemptClient}
    />
  )
}
