import { fetchAllDiagnosticAttemptsClient } from "./attemptsClient"
import type { TestContent } from "@/src/tests/model/tests"

/**
 * Browser-side composed loaders for the Diagnostic Test: fetch the merged
 * content payload (no client DB — it's a single assessment) and the user's
 * attempts, then combine into the shape the Home card needs.
 */

export async function loadDiagnosticContent(): Promise<TestContent | null> {
  const res = await fetch("/api/diagnostics/content", { cache: "no-store" })
  if (!res.ok) throw new Error("Could not load the diagnostic test.")
  const data = (await res.json()) as { version: string; tests: TestContent[] }
  return data.tests[0] ?? null
}

export interface DiagnosticCardData {
  test: TestContent | null
  attemptCount: number
  /** Most recent attempt's percent, or null if never taken. */
  lastScore: number | null
  /** Best percent across attempts, or null if never taken. */
  bestScore: number | null
}

export async function loadDiagnosticCard(): Promise<DiagnosticCardData> {
  const [test, attempts] = await Promise.all([
    loadDiagnosticContent(),
    fetchAllDiagnosticAttemptsClient(),
  ])
  const percents = attempts.map((a) => a.percent)
  return {
    test,
    attemptCount: attempts.length,
    lastScore: attempts.length ? attempts[0].percent : null,
    bestScore: percents.length ? Math.max(...percents) : null,
  }
}
