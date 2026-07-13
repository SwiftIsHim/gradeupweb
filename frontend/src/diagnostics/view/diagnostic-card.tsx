"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Clock, Sparkles, Target, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { loadDiagnosticCard } from "@/src/diagnostics/data/loadDiagnostics"
import type { DiagnosticCardData } from "@/src/diagnostics/data/loadDiagnostics"

/**
 * Home-page card for the Diagnostic Test, directly under the welcome banner.
 * A client island (like ContinueLearning) since it needs the user's attempt
 * history to show last/best score. Renders nothing while loading or if no
 * diagnostic content is available, to avoid a layout flash / broken feature.
 */
export function DiagnosticCard() {
  const [data, setData] = useState<DiagnosticCardData | null>(null)

  useEffect(() => {
    let cancelled = false
    loadDiagnosticCard()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch(() => {
        if (!cancelled) {
          setData({ test: null, attemptCount: 0, lastScore: null, bestScore: null })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (data === null || data.test === null) return null

  const { test, attemptCount, lastScore, bestScore } = data
  const taken = attemptCount > 0

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
              Diagnostic Test
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {test.title}
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {test.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                {test.questionCount} questions
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {test.timeLimitMinutes} min
              </span>
              {bestScore !== null && (
                <span className="inline-flex items-center gap-1 text-green-700">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Best {bestScore}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-48">
          {taken && (
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>Last score</span>
                <span className="font-medium text-foreground">{lastScore}%</span>
              </div>
              <Progress value={lastScore ?? 0} className="h-2" />
            </div>
          )}
          <Button asChild variant="brand" className="w-full">
            <Link href="/dashboard/diagnostics/take">
              {taken ? "Retake diagnostic" : "Start diagnostic"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
