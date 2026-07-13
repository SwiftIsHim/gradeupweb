import * as Sentry from "@sentry/nextjs"

import type { SubmitAttemptPayload } from "@/src/tests/data/attemptsClient"
import type { DiagnosticAttempt } from "@/src/diagnostics/model/diagnostics"

/**
 * Browser-side diagnostic attempt helpers. They call the Next route handlers
 * (which attach the httpOnly access-token cookie and proxy the backend). A 401
 * degrades to "no attempts" / null rather than throwing. Mirrors
 * src/tests/data/attemptsClient.ts.
 */

export async function fetchAllDiagnosticAttemptsClient(): Promise<DiagnosticAttempt[]> {
  const res = await fetch("/api/diagnostics/attempts", { cache: "no-store" })
  if (res.status === 401) return []
  if (!res.ok) throw new Error("Could not load your diagnostic attempts.")
  const data = (await res.json()) as { attempts?: DiagnosticAttempt[] }
  return data.attempts ?? []
}

/** Record a diagnostic attempt; returns the saved attempt, or null if not signed in. */
export async function submitDiagnosticAttemptClient(
  slug: string,
  payload: SubmitAttemptPayload,
): Promise<DiagnosticAttempt | null> {
  Sentry.addBreadcrumb({
    category: "diagnostic.attempt",
    message: `Submitting diagnostic attempt for ${slug}`,
    data: { slug, score: payload.score, total: payload.total },
  })

  try {
    const res = await fetch(
      `/api/diagnostics/${encodeURIComponent(slug)}/attempts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    )
    if (res.status === 401) return null
    if (!res.ok) throw new Error("Could not save your diagnostic result.")
    const data = (await res.json()) as { attempt?: DiagnosticAttempt }
    return data.attempt ?? null
  } catch (error) {
    Sentry.captureException(error, {
      tags: { flow: "diagnostic-attempt-submit" },
      extra: { slug },
    })
    throw error
  }
}
