import { getDatabase } from "./database"
import type { CourseContentPayload } from "@/src/courses/model/courses"

/**
 * Seeds course content into WatermelonDB from the local JSON, served by
 * /api/courses/content. Content is read-only and re-derivable, so the strategy
 * is simply: if the served `version` differs from what we last seeded (or the
 * DB is empty), wipe and re-import everything. The fetch + seed runs at most
 * once per page session (memoized promise).
 */

const VERSION_KEY = "gradeup_courses_version"

let seedPromise: Promise<void> | null = null

export function ensureSeeded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (!seedPromise) {
    seedPromise = doSeed().catch((error) => {
      // Allow a later retry if seeding failed (e.g. transient network error).
      seedPromise = null
      throw error
    })
  }
  return seedPromise
}

async function doSeed(): Promise<void> {
  const res = await fetch("/api/courses/content", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Could not load course content.")
  }
  const payload = (await res.json()) as CourseContentPayload

  const db = await getDatabase()
  const storedVersion = window.localStorage.getItem(VERSION_KEY)
  const existingCount = await db.get("courses").query().fetchCount()

  // Up to date — nothing to do.
  if (storedVersion === payload.version && existingCount > 0) return

  await db.write(async () => {
    // Clear any previously-seeded content, then re-import.
    const [courses, chapters, questions] = await Promise.all([
      db.get("courses").query().fetch(),
      db.get("chapters").query().fetch(),
      db.get("questions").query().fetch(),
    ])
    const stale = [...courses, ...chapters, ...questions]
    if (stale.length) {
      await db.batch(...stale.map((r) => r.prepareDestroyPermanently()))
    }

    const ops = []
    for (const course of payload.courses) {
      ops.push(
        db.get("courses").prepareCreate((rec) => {
          rec._setRaw("slug", course.slug)
          rec._setRaw("title", course.title)
          rec._setRaw("description", course.description)
          rec._setRaw("cover_url", course.coverUrl)
          rec._setRaw("total_chapters", course.totalChapters)
          rec._setRaw("total_pages", course.totalPages)
        }),
      )
      for (const ch of course.chapters) {
        ops.push(
          db.get("chapters").prepareCreate((rec) => {
            rec._setRaw("course_slug", course.slug)
            rec._setRaw("chapter_number", ch.chapterNumber)
            rec._setRaw("title", ch.title)
            rec._setRaw("sections", JSON.stringify(ch.sections))
            rec._setRaw(
              "learning_objectives",
              JSON.stringify(ch.learningObjectives),
            )
            rec._setRaw("key_terms", JSON.stringify(ch.keyTerms))
          }),
        )
      }
      for (const q of course.questions) {
        ops.push(
          db.get("questions").prepareCreate((rec) => {
            rec._setRaw("course_slug", course.slug)
            rec._setRaw("chapter_number", q.chapterNumber)
            rec._setRaw("stem", q.stem)
            rec._setRaw("explanation", q.explanation)
            rec._setRaw("difficulty", q.difficulty)
            rec._setRaw("options", JSON.stringify(q.options))
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
