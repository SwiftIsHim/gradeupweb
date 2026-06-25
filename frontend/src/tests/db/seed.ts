import { getTestsDatabase } from "./database"
import type { TestContentPayload } from "@/src/tests/model/tests"

/**
 * Seeds test content into WatermelonDB from the local JSON (served by
 * /api/tests/content). Content is read-only and re-derivable, so: if the served
 * `version` differs from what we last seeded (or the DB is empty), wipe and
 * re-import. Runs at most once per page session (memoized promise).
 */

const VERSION_KEY = "gradeup_tests_version"

let seedPromise: Promise<void> | null = null

export function ensureSeeded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (!seedPromise) {
    seedPromise = doSeed().catch((error) => {
      seedPromise = null
      throw error
    })
  }
  return seedPromise
}

async function doSeed(): Promise<void> {
  const res = await fetch("/api/tests/content", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Could not load test content.")
  }
  const payload = (await res.json()) as TestContentPayload

  const db = await getTestsDatabase()
  const storedVersion = window.localStorage.getItem(VERSION_KEY)
  const existingCount = await db.get("tests").query().fetchCount()

  if (storedVersion === payload.version && existingCount > 0) return

  await db.write(async () => {
    const [tests, questions] = await Promise.all([
      db.get("tests").query().fetch(),
      db.get("test_questions").query().fetch(),
    ])
    const stale = [...tests, ...questions]
    if (stale.length) {
      await db.batch(...stale.map((r) => r.prepareDestroyPermanently()))
    }

    const ops = []
    for (const test of payload.tests) {
      ops.push(
        db.get("tests").prepareCreate((rec) => {
          rec._setRaw("slug", test.slug)
          rec._setRaw("title", test.title)
          rec._setRaw("description", test.description)
          rec._setRaw("question_count", test.questionCount)
          rec._setRaw("time_limit_minutes", test.timeLimitMinutes)
        }),
      )
      for (const q of test.questions) {
        ops.push(
          db.get("test_questions").prepareCreate((rec) => {
            rec._setRaw("test_slug", test.slug)
            rec._setRaw("order_index", q.index)
            rec._setRaw("prompt", q.prompt)
            rec._setRaw("options", JSON.stringify(q.options))
            rec._setRaw("answer_key", q.answerKey)
          }),
        )
      }
    }
    if (ops.length) {
      await db.batch(...ops)
    }
  })

  window.localStorage.setItem(VERSION_KEY, payload.version)
}
