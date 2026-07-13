import { createHash } from "node:crypto"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

import { normalizeTest } from "@/src/tests/data/normalizeTest"
import type { TestContent, TestQuestion } from "@/src/tests/model/tests"

/**
 * Serves the diagnostic test, read from the local JSON files under
 * `frontend/Diagnostics_Test/`. Unlike Tests (one file = one test), every
 * `*.json` here contributes questions to a single merged diagnostic — the
 * feature is one assessment, so multiple files are just a way to organize its
 * question bank. `version` (a hash of the raw files) lets the client know
 * when content changed.
 */

const DIAGNOSTICS_DIR = path.join(process.cwd(), "Diagnostics_Test")

export async function GET() {
  let files: string[]
  try {
    files = (await readdir(DIAGNOSTICS_DIR))
      .filter((name) => name.toLowerCase().endsWith(".json"))
      .sort()
  } catch {
    return Response.json({ version: "empty", tests: [] })
  }

  const hash = createHash("sha1")
  const questions: TestQuestion[] = []

  for (const name of files) {
    let raw: string
    try {
      raw = await readFile(path.join(DIAGNOSTICS_DIR, name), "utf8")
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
    const partial = normalizeTest(parsed, fileBase)
    for (const q of partial.questions) {
      questions.push({ ...q, index: questions.length })
    }

    hash.update(name).update("\0").update(raw)
  }

  if (questions.length === 0) {
    return Response.json({ version: "empty", tests: [] })
  }

  const test: TestContent = {
    slug: "diagnostic-assessment",
    title: "Diagnostic Assessment",
    description:
      "A quick check-in to see where you stand before you dive into practice tests.",
    questionCount: questions.length,
    timeLimitMinutes: Math.max(5, questions.length),
    questions,
  }

  return Response.json({ version: hash.digest("hex"), tests: [test] })
}
