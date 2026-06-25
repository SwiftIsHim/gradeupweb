import { Database } from "@nozbe/watermelondb"

import { schema } from "./schema"
import { TestModel, TestQuestionModel } from "./models"

/**
 * Lazily-created, browser-only WatermelonDB instance for test content, backed
 * by the LokiJS adapter (separate `dbName` from the courses database). The
 * adapter — the only browser-coupled part — is dynamically imported so this
 * module is safe to evaluate during server rendering.
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
    dbName: "gradeup_tests",
    onSetUpError: (error) => {
      console.error("WatermelonDB (tests) setup failed:", error)
    },
  })

  return new Database({
    adapter,
    modelClasses: [TestModel, TestQuestionModel],
  })
}

/** Resolve the singleton tests database. Rejects if called outside the browser. */
export function getTestsDatabase(): Promise<Database> {
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
