"use client"

import { useEffect, useState } from "react"

import { fetchAllAttemptsClient } from "@/src/tests/data/attemptsClient"
import { toTestStats } from "@/src/tests/data/assemble"
import { fetchAllDiagnosticAttemptsClient } from "@/src/diagnostics/data/attemptsClient"

/**
 * Readiness score = average of the Tests section's overall average score and
 * the diagnostic test's most recent score, both as percents. If only one of
 * the two exists yet, that one stands in alone rather than waiting for both —
 * so the stat is useful as soon as the user has done anything.
 */
function computeReadiness(
  testsAverage: number | null,
  diagnosticScore: number | null,
): number | null {
  if (testsAverage !== null && diagnosticScore !== null) {
    return Math.round((testsAverage + diagnosticScore) / 2)
  }
  return testsAverage ?? diagnosticScore
}

export function ReadinessScoreValue() {
  const [loaded, setLoaded] = useState(false)
  const [value, setValue] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAllAttemptsClient(), fetchAllDiagnosticAttemptsClient()])
      .then(([testAttempts, diagnosticAttempts]) => {
        if (cancelled) return
        const testsAverage = toTestStats(testAttempts).averageScore
        const diagnosticScore = diagnosticAttempts.length
          ? diagnosticAttempts[0].percent
          : null
        setValue(computeReadiness(testsAverage, diagnosticScore))
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loaded) return <>—</>
  return <>{value === null ? "—" : `${value}%`}</>
}
