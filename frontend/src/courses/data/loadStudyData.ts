import { queryCatalog, queryCourse } from "@/src/courses/db/queries"
import {
  fetchAllProgressClient,
  fetchCourseProgressClient,
} from "./progressClient"
import {
  toCourseSummary,
  toCourseDetail,
  toChapterContent,
  toQuizData,
  toFlashcards,
} from "./assemble"
import type {
  CourseSummary,
  CourseDetail,
  ChapterContent,
  QuizData,
  FlashcardsData,
} from "@/src/courses/model/courses"

/**
 * Browser-side composed loaders for the study flow: read content from
 * WatermelonDB, fetch progress from the backend, and merge into the view
 * shapes. Used by the course page loaders and the dashboard's "Continue
 * learning" island. A `null` result means "not found".
 */

export async function loadCourseSummaries(): Promise<CourseSummary[]> {
  const [catalog, progress] = await Promise.all([
    queryCatalog(),
    fetchAllProgressClient(),
  ])
  const bySlug = new Map(progress.map((p) => [p.courseSlug, p]))
  return catalog.map((entry) => toCourseSummary(entry, bySlug.get(entry.slug)))
}

export async function loadCourseDetail(
  slug: string,
): Promise<CourseDetail | null> {
  const [content, progress] = await Promise.all([
    queryCourse(slug),
    fetchCourseProgressClient(slug),
  ])
  if (!content) return null
  return toCourseDetail(content, progress)
}

export async function loadChapter(
  slug: string,
  chapterNumber: number,
): Promise<ChapterContent | null> {
  const [content, progress] = await Promise.all([
    queryCourse(slug),
    fetchCourseProgressClient(slug),
  ])
  if (!content) return null
  return toChapterContent(content, chapterNumber, progress)
}

export async function loadQuiz(
  slug: string,
  chapterNumber: number,
): Promise<QuizData | null> {
  const content = await queryCourse(slug)
  if (!content) return null
  return toQuizData(content, chapterNumber)
}

export async function loadFlashcards(
  slug: string,
): Promise<FlashcardsData | null> {
  const content = await queryCourse(slug)
  if (!content) return null
  return toFlashcards(content)
}
