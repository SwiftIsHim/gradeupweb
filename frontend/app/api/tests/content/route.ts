import { createHash } from "node:crypto"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

import { normalizeTest } from "@/src/tests/data/normalizeTest"
import type { TestContent } from "@/src/tests/model/tests"

/**
 * Serves test content read directly from the local JSON files under
 * `frontend/Tests/`. Every `*.json` in that folder becomes one test. The
 * client fetches this once and seeds it into WatermelonDB; `version` (a hash of
 * the raw files) lets the client re-seed only when content changes.
 */

const TESTS_DIR = path.join(process.cwd(), "Tests")

export async function GET() {
  let files: string[]
  try {
    files = (await readdir(TESTS_DIR))
      .filter((name) => name.toLowerCase().endsWith(".json"))
      .sort()
  } catch {
    return Response.json({ version: "empty", tests: [] })
  }

  const hash = createHash("sha1")
  const tests: TestContent[] = []
  const seenSlugs = new Set<string>()

  for (const name of files) {
    let raw: string
    try {
      raw = await readFile(path.join(TESTS_DIR, name), "utf8")
    } catch {
      continue
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      continue
    }

    const fileBase = name.replace(/\.json$/i, "")
    const test = normalizeTest(parsed, fileBase)
    if (!test.slug || test.questionCount === 0 || seenSlugs.has(test.slug)) {
      continue
    }
    seenSlugs.add(test.slug)

    hash.update(name).update("\0").update(raw)
    tests.push(test)
  }

  return Response.json({ version: hash.digest("hex"), tests })
}
