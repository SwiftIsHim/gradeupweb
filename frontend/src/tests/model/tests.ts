/**
 * Domain types for the Tests section.
 *
 * Test *content* (questions) is read from the local JSON files (see
 * ../data/normalizeTest + app/api/tests/content) and stored on the client in
 * WatermelonDB (see ../db). User *attempts* are persisted on the backend (see
 * ../repository/testsRepository). The catalog/summary shape is assembled on the
 * client by merging content with the user's attempts.
 */

// ── Content (read from local JSON, seeded into WatermelonDB) ─────────────────

export interface TestOption {
  /** "A" | "B" | "C" | "D". */
  key: string
  content: string
}

export interface TestQuestion {
  /** 0-based position within the test. */
  index: number
  prompt: string
  options: TestOption[]
  /** The correct option key. */
  answerKey: string
}

export interface TestContent {
  slug: string
  title: string
  description: string
  questionCount: number
  timeLimitMinutes: number
  questions: TestQuestion[]
}

/** Response of GET /api/tests/content: all tests + a content version. */
export interface TestContentPayload {
  version: string
  tests: TestContent[]
}

// ── Attempts (persisted on the backend) ──────────────────────────────────────

export interface AttemptAnswer {
  questionIndex: number
  selectedKey: string | null
  correctKey: string
  isCorrect: boolean
}

export interface TestAttempt {
  id: string
  testSlug: string
  score: number
  total: number
  percent: number
  durationSeconds: number | null
  takenAt: string
  answers: AttemptAnswer[]
}

// ── View-facing shapes (content merged with attempts) ────────────────────────

/** A catalog tile / hub card for one test. */
export interface TestSummary {
  slug: string
  title: string
  description: string
  questionCount: number
  timeLimitMinutes: number
  attemptCount: number
  /** Best percent across attempts, or null if never taken. */
  bestScore: number | null
  /** Most recent attempt's percent, or null if never taken. */
  lastScore: number | null
}

/** Aggregate stats for the hub banner, derived from all attempts. */
export interface TestStats {
  testsTaken: number
  averageScore: number | null
  bestScore: number | null
}

/** Everything the take-test screen needs. */
export interface TestRunnerData {
  content: TestContent
}
