import { queryTestCatalog, queryTest } from "@/src/tests/db/queries"
import { fetchAllAttemptsClient } from "./attemptsClient"
import { toTestSummary, toTestStats } from "./assemble"
import type {
  TestContent,
  TestSummary,
  TestStats,
  TestAttempt,
} from "@/src/tests/model/tests"

/**
 * Browser-side composed loaders for the Tests section: read content from
 * WatermelonDB, fetch attempts from the backend, and merge into view shapes.
 */

export interface TestsHubData {
  tests: TestSummary[]
  stats: TestStats
  recentAttempts: TestAttempt[]
}

export async function loadTestsHub(): Promise<TestsHubData> {
  const [catalog, attempts] = await Promise.all([
    queryTestCatalog(),
    fetchAllAttemptsClient(),
  ])

  const bySlug = new Map<string, TestAttempt[]>()
  for (const attempt of attempts) {
    const list = bySlug.get(attempt.testSlug) ?? []
    list.push(attempt)
    bySlug.set(attempt.testSlug, list)
  }

  return {
    tests: catalog.map((entry) =>
      toTestSummary(entry, bySlug.get(entry.slug) ?? []),
    ),
    stats: toTestStats(attempts),
    recentAttempts: attempts.slice(0, 5),
  }
}

export async function loadTestContent(
  slug: string,
): Promise<TestContent | null> {
  return queryTest(slug)
}
