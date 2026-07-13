import type { AttemptAnswer } from "@/src/tests/model/tests"

/**
 * Domain types for the Diagnostic Test. Content (questions) is read from
 * `Diagnostics_Test/*.json` (see ../data + app/api/diagnostics/content) and
 * reuses the same `TestContent`/`TestQuestion` shape as the Tests section —
 * the JSON format and the take/results UI are identical. User attempts persist
 * on the backend under /diagnostic-attempts, separately from Tests attempts,
 * so the two scores can be tracked (and averaged into readiness) independently.
 */
export interface DiagnosticAttempt {
  id: string
  diagnosticSlug: string
  score: number
  total: number
  percent: number
  durationSeconds: number | null
  takenAt: string
  answers: AttemptAnswer[]
}
