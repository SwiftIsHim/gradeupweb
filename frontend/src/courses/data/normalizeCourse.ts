import "server-only"

/**
 * Normalizes a raw course JSON export (the shape produced by the content
 * pipeline, e.g. `frontend/courses/first.json`) into the flat content payload
 * the client seeds into WatermelonDB.
 *
 * This is the successor to the old `backend/src/scripts/seedCourses.js`: the
 * same slugify / de-duplication / chapter+question mapping, but it produces a
 * plain object instead of writing to MongoDB. Course content no longer lives
 * in the backend — it is read from these JSON files at request time (see
 * `app/api/courses/content/route.ts`) and stored locally on the client.
 */

import type {
  CourseContent,
  ContentChapter,
  ContentQuestion,
  ChapterSection,
  KeyTerm,
} from "@/src/courses/model/courses"

export function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/** Drop duplicate strings, preserving first-seen order. */
function uniqStrings(list: unknown): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of Array.isArray(list) ? list : []) {
    const value = String(raw).trim()
    const key = value.toLowerCase()
    if (value && !seen.has(key)) {
      seen.add(key)
      out.push(value)
    }
  }
  return out
}

/** Drop duplicate key terms by term (case-insensitive), preserving order. */
function uniqKeyTerms(list: unknown): KeyTerm[] {
  const seen = new Set<string>()
  const out: KeyTerm[] = []
  for (const item of Array.isArray(list) ? list : []) {
    const term = String(item?.term ?? "").trim()
    const key = term.toLowerCase()
    if (term && !seen.has(key)) {
      seen.add(key)
      out.push({ term, definition: String(item?.definition ?? "").trim() })
    }
  }
  return out
}

/* Loosely-typed view of the raw JSON so we can read it defensively. */
interface RawDoc {
  documentMetadata?: {
    title?: string
    sourceFile?: string
    totalChapters?: number
    totalPages?: number
  }
  bookCoverUrl?: string
  chapters?: Array<{
    chapterNumber?: number
    title?: string
    sections?: unknown[]
    learningObjectives?: unknown
    keyTerms?: unknown
  }>
  questions?: Record<
    string,
    Array<{
      stem?: string
      explanation?: string
      difficulty?: number
      options?: Array<{
        content?: string
        isCorrect?: boolean
        orderIndex?: number
      }>
    }>
  >
}

/** Turn one parsed course JSON document into a normalized content payload. */
export function normalizeCourse(raw: unknown): CourseContent {
  const doc = (raw ?? {}) as RawDoc
  const meta = doc.documentMetadata ?? {}
  const title = meta.title || meta.sourceFile || "Untitled Course"
  const slug = slugify(title)

  const chapters: ContentChapter[] = (doc.chapters ?? []).map((ch) => ({
    chapterNumber: Number(ch.chapterNumber),
    title: String(ch.title ?? ""),
    // Sections are stored loosely-typed exactly as exported; the reader
    // renders them defensively by `type`, so we trust the shape here.
    sections: (Array.isArray(ch.sections) ? ch.sections : []) as ChapterSection[],
    learningObjectives: uniqStrings(ch.learningObjectives),
    keyTerms: uniqKeyTerms(ch.keyTerms),
  }))

  // The `questions` map is keyed "chapter1", "chapter2"…
  const questions: ContentQuestion[] = []
  const questionMap = doc.questions ?? {}
  for (const [key, listRaw] of Object.entries(questionMap)) {
    const chapterNumber = Number(String(key).replace(/[^0-9]/g, ""))
    const list = Array.isArray(listRaw) ? listRaw : []
    if (!chapterNumber) continue
    for (const q of list) {
      if (!q?.stem || !Array.isArray(q.options)) continue
      questions.push({
        chapterNumber,
        stem: String(q.stem),
        explanation: String(q.explanation ?? ""),
        difficulty: typeof q.difficulty === "number" ? q.difficulty : 1,
        options: q.options.map((o, i) => ({
          content: String(o?.content ?? ""),
          isCorrect: Boolean(o?.isCorrect),
          orderIndex: typeof o?.orderIndex === "number" ? o.orderIndex : i,
        })),
      })
    }
  }

  return {
    slug,
    title,
    description: meta.sourceFile || "",
    coverUrl: doc.bookCoverUrl || "",
    totalChapters: meta.totalChapters || chapters.length,
    totalPages: meta.totalPages || 0,
    chapters,
    questions,
  }
}
