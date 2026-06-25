import "server-only"

import type {
  TestContent,
  TestQuestion,
  TestOption,
} from "@/src/tests/model/tests"

/**
 * Normalizes a raw test JSON file (the flat question-pool shape used in
 * `frontend/Tests/*.json`) into the content payload the client seeds into
 * WatermelonDB. One JSON file becomes one test; its slug/title are derived
 * from the file name since the JSON itself carries no metadata.
 */

export function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/** "civil_service_questions" → "Civil Service Practice Test". */
function titleFromFile(base: string): string {
  const words = base
    .replace(/[_-]+/g, " ")
    .replace(/\bquestions?\b/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
  const name = words.join(" ")
  return name ? `${name} Practice Test` : "Practice Test"
}

const OPTION_KEYS = ["A", "B", "C", "D"] as const

interface RawDoc {
  questions?: Array<{
    question?: string
    options?: Record<string, unknown>
    answer?: string
  }>
}

/**
 * Turn one parsed test JSON document into a normalized test.
 * @param fileBase the file name without extension, used for slug + title.
 */
export function normalizeTest(raw: unknown, fileBase: string): TestContent {
  const doc = (raw ?? {}) as RawDoc
  const slug = slugify(fileBase)
  const title = titleFromFile(fileBase)

  const questions: TestQuestion[] = []
  for (const q of doc.questions ?? []) {
    const prompt = String(q?.question ?? "").trim()
    const rawOptions = q?.options ?? {}
    const answerKey = String(q?.answer ?? "").trim().toUpperCase()
    if (!prompt || !answerKey) continue

    const options: TestOption[] = OPTION_KEYS.filter(
      (key) => rawOptions[key] !== undefined && rawOptions[key] !== null,
    ).map((key) => ({ key, content: String(rawOptions[key]) }))

    // Need at least two options and a correct key that actually exists.
    if (options.length < 2) continue
    if (!options.some((o) => o.key === answerKey)) continue

    questions.push({ index: questions.length, prompt, options, answerKey })
  }

  const questionCount = questions.length
  return {
    slug,
    title,
    description: `${questionCount} multiple-choice questions`,
    questionCount,
    // One minute per question, with a sensible floor.
    timeLimitMinutes: Math.max(5, questionCount),
    questions,
  }
}
