import { Q } from "@nozbe/watermelondb"

import { getDatabase } from "./database"
import { ensureSeeded } from "./seed"
import type { CourseModel, ChapterModel, QuestionModel } from "./models"
import type { CourseContent } from "@/src/courses/model/courses"

/**
 * Read-side of the local content store. Each helper makes sure content has
 * been seeded, then reads it back out of WatermelonDB and reshapes it into the
 * plain content types. Progress is *not* included here — callers merge it in
 * separately (see ../data/assemble).
 */

/** Lightweight catalog entry for the Study hub (no chapter/question bodies). */
export interface CourseCatalogEntry {
  slug: string
  title: string
  description: string
  coverUrl: string
  totalChapters: number
  questionCount: number
}

/** Total number of flashcards (key terms) across every course. */
export async function queryFlashcardTotal(): Promise<number> {
  await ensureSeeded()
  const db = await getDatabase()
  const chapters = (await db
    .get<ChapterModel>("chapters")
    .query()
    .fetch()) as ChapterModel[]
  return chapters.reduce((sum, ch) => sum + ch.keyTerms.length, 0)
}

export async function queryCatalog(): Promise<CourseCatalogEntry[]> {
  await ensureSeeded()
  const db = await getDatabase()
  const courses = (await db
    .get<CourseModel>("courses")
    .query()
    .fetch()) as CourseModel[]

  const entries = await Promise.all(
    courses.map(async (course) => ({
      slug: course.slug,
      title: course.title,
      description: course.description,
      coverUrl: course.coverUrl,
      totalChapters: course.totalChapters,
      questionCount: await db
        .get<QuestionModel>("questions")
        .query(Q.where("course_slug", course.slug))
        .fetchCount(),
    })),
  )

  entries.sort((a, b) => a.title.localeCompare(b.title))
  return entries
}

/** Full content for one course (chapters sorted, with all questions). */
export async function queryCourse(slug: string): Promise<CourseContent | null> {
  await ensureSeeded()
  const db = await getDatabase()

  const courses = (await db
    .get<CourseModel>("courses")
    .query(Q.where("slug", slug))
    .fetch()) as CourseModel[]
  const course = courses[0]
  if (!course) return null

  const [chapters, questions] = await Promise.all([
    db
      .get<ChapterModel>("chapters")
      .query(Q.where("course_slug", slug))
      .fetch() as Promise<ChapterModel[]>,
    db
      .get<QuestionModel>("questions")
      .query(Q.where("course_slug", slug))
      .fetch() as Promise<QuestionModel[]>,
  ])

  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    coverUrl: course.coverUrl,
    totalChapters: course.totalChapters,
    totalPages: course.totalPages,
    chapters: chapters
      .map((ch) => ({
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        sections: ch.sections,
        learningObjectives: ch.learningObjectives,
        keyTerms: ch.keyTerms,
      }))
      .sort((a, b) => a.chapterNumber - b.chapterNumber),
    questions: questions.map((q) => ({
      chapterNumber: q.chapterNumber,
      stem: q.stem,
      explanation: q.explanation,
      difficulty: q.difficulty,
      options: q.options,
    })),
  }
}
