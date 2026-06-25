import type {
  TestAttempt,
  TestSummary,
  TestStats,
} from "@/src/tests/model/tests"
import type { TestCatalogEntry } from "@/src/tests/db/queries"

/**
 * Pure merges of local test content with backend attempts into the view-facing
 * shapes (catalog summaries + hub stats).
 */

/** Catalog tile: content + the user's best/last result for that test. */
export function toTestSummary(
  entry: TestCatalogEntry,
  attempts: TestAttempt[],
): TestSummary {
  // Backend returns attempts most-recent-first.
  const percents = attempts.map((a) => a.percent)
  return {
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    questionCount: entry.questionCount,
    timeLimitMinutes: entry.timeLimitMinutes,
    attemptCount: attempts.length,
    bestScore: percents.length ? Math.max(...percents) : null,
    lastScore: attempts.length ? attempts[0].percent : null,
  }
}

/** Hub banner stats across every attempt. */
export function toTestStats(attempts: TestAttempt[]): TestStats {
  if (attempts.length === 0) {
    return { testsTaken: 0, averageScore: null, bestScore: null }
  }
  const percents = attempts.map((a) => a.percent)
  const average = Math.round(
    percents.reduce((sum, p) => sum + p, 0) / percents.length,
  )
  return {
    testsTaken: attempts.length,
    averageScore: average,
    bestScore: Math.max(...percents),
  }
}
