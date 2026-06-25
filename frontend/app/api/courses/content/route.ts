import { createHash } from "node:crypto"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

import { normalizeCourse } from "@/src/courses/data/normalizeCourse"
import type { CourseContent } from "@/src/courses/model/courses"

/**
 * Serves all course content read directly from the local JSON files under
 * `frontend/courses/`. Every `*.json` in that folder becomes one course, so
 * dropping in a new file adds a course. The client fetches this once and seeds
 * it into WatermelonDB; `version` (a hash of the raw files) lets the client
 * re-seed only when the content actually changes.
 *
 * This replaces the old MongoDB-backed `/courses` content API — there is no
 * database round-trip here, just the filesystem.
 */

const COURSES_DIR = path.join(process.cwd(), "courses")

export async function GET() {
  let files: string[]
  try {
    files = (await readdir(COURSES_DIR))
      .filter((name) => name.toLowerCase().endsWith(".json"))
      .sort()
  } catch {
    // No courses folder yet — return an empty, stable payload.
    return Response.json({ version: "empty", courses: [] })
  }

  const hash = createHash("sha1")
  const courses: CourseContent[] = []
  const seenSlugs = new Set<string>()

  for (const name of files) {
    let raw: string
    try {
      raw = await readFile(path.join(COURSES_DIR, name), "utf8")
    } catch {
      continue
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Skip malformed JSON rather than failing the whole catalog.
      continue
    }

    const course = normalizeCourse(parsed)
    // First file wins on a slug collision; keeps the catalog de-duplicated.
    if (!course.slug || seenSlugs.has(course.slug)) continue
    seenSlugs.add(course.slug)

    hash.update(name).update("\0").update(raw)
    courses.push(course)
  }

  return Response.json({ version: hash.digest("hex"), courses })
}
