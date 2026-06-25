import { Database } from "@nozbe/watermelondb"

import { schema } from "./schema"
import { CourseModel, ChapterModel, QuestionModel } from "./models"

/**
 * Lazily-created, browser-only WatermelonDB instance backed by the LokiJS
 * adapter (IndexedDB under the hood).
 *
 * WatermelonDB on web must never run during server rendering, so the LokiJS
 * adapter — the only part that touches browser globals — is dynamically
 * imported inside the builder and the instance is guarded behind a
 * `typeof window` check. Callers always `await getDatabase()`.
 */

let dbPromise: Promise<Database> | null = null

async function build(): Promise<Database> {
  const { default: LokiJSAdapter } = await import(
    "@nozbe/watermelondb/adapters/lokijs"
  )

  const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    dbName: "gradeup_courses",
    // Content is disposable and re-seedable; on any setup error just reset.
    onSetUpError: (error) => {
      console.error("WatermelonDB setup failed:", error)
    },
  })

  return new Database({
    adapter,
    modelClasses: [CourseModel, ChapterModel, QuestionModel],
  })
}

/** Resolve the singleton database. Rejects if called outside the browser. */
export function getDatabase(): Promise<Database> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("WatermelonDB is only available in the browser."),
    )
  }
  if (!dbPromise) {
    dbPromise = build()
  }
  return dbPromise
}
