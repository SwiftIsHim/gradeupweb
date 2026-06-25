import type {
  CourseContent,
  CourseSummary,
  CourseDetail,
  ChapterContent,
  QuizData,
  FlashcardsData,
  RawProgress,
} from "@/src/courses/model/courses"
import type { CourseCatalogEntry } from "@/src/courses/db/queries"

/**
 * Pure functions that merge local course content with backend progress into
 * the view-facing shapes. This is the merge the Express/Mongo service used to
 * perform; it now happens on the client because content and progress come from
 * two different places (WatermelonDB and the backend).
 */

const EMPTY_PROGRESS: Omit<RawProgress, "courseSlug"> = {
  chaptersCompleted: [],
  lastChapterNumber: null,
  quizResults: [],
}

function percent(completedCount: number, total: number): number {
  if (!total) return 0
  return Math.round((completedCount / total) * 100)
}

/** Catalog tile: content + how far the user has gotten. */
export function toCourseSummary(
  entry: CourseCatalogEntry,
  progress?: RawProgress,
): CourseSummary {
  const completed = progress?.chaptersCompleted.length ?? 0
  return {
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    coverUrl: entry.coverUrl,
    totalChapters: entry.totalChapters,
    questionCount: entry.questionCount,
    chaptersCompleted: completed,
    progress: percent(completed, entry.totalChapters),
  }
}

/** Count questions per chapter number for a course's content. */
function questionCountByChapter(content: CourseContent): Map<number, number> {
  const counts = new Map<number, number>()
  for (const q of content.questions) {
    counts.set(q.chapterNumber, (counts.get(q.chapterNumber) ?? 0) + 1)
  }
  return counts
}

/** Course detail page: metadata + chapter list with completion + quiz counts. */
export function toCourseDetail(
  content: CourseContent,
  progress: RawProgress | null,
): CourseDetail {
  const p = progress ?? { ...EMPTY_PROGRESS, courseSlug: content.slug }
  const completedSet = new Set(p.chaptersCompleted)
  const counts = questionCountByChapter(content)

  return {
    slug: content.slug,
    title: content.title,
    description: content.description,
    coverUrl: content.coverUrl,
    totalChapters: content.totalChapters,
    totalPages: content.totalPages,
    chaptersCompleted: completedSet.size,
    progress: percent(completedSet.size, content.totalChapters),
    lastChapterNumber: p.lastChapterNumber,
    chapters: content.chapters.map((ch) => ({
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      objectiveCount: ch.learningObjectives.length,
      keyTermCount: ch.keyTerms.length,
      questionCount: counts.get(ch.chapterNumber) ?? 0,
      completed: completedSet.has(ch.chapterNumber),
    })),
  }
}

/** Full reading content for one chapter, plus prev/next navigation. */
export function toChapterContent(
  content: CourseContent,
  chapterNumber: number,
  progress: RawProgress | null,
): ChapterContent | null {
  const chapter = content.chapters.find(
    (ch) => ch.chapterNumber === chapterNumber,
  )
  if (!chapter) return null

  const counts = questionCountByChapter(content)
  const completed = (progress?.chaptersCompleted ?? []).includes(chapterNumber)
  const hasPrev = chapterNumber > 1
  const hasNext = chapterNumber < content.totalChapters

  return {
    courseSlug: content.slug,
    courseTitle: content.title,
    chapterNumber: chapter.chapterNumber,
    title: chapter.title,
    sections: chapter.sections,
    learningObjectives: chapter.learningObjectives,
    keyTerms: chapter.keyTerms,
    questionCount: counts.get(chapterNumber) ?? 0,
    completed,
    prevChapter: hasPrev ? chapterNumber - 1 : null,
    nextChapter: hasNext ? chapterNumber + 1 : null,
  }
}

/** Quiz questions for one chapter (options carry correctness for grading). */
export function toQuizData(
  content: CourseContent,
  chapterNumber: number,
): QuizData {
  const questions = content.questions.filter(
    (q) => q.chapterNumber === chapterNumber,
  )

  return {
    courseSlug: content.slug,
    chapterNumber,
    questions: questions.map((q, i) => ({
      id: `${content.slug}-${chapterNumber}-${i}`,
      stem: q.stem,
      explanation: q.explanation,
      difficulty: q.difficulty,
      options: [...q.options]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((o) => ({ content: o.content, isCorrect: o.isCorrect })),
    })),
  }
}

/** All key terms across the course as flashcards, grouped by chapter. */
export function toFlashcards(content: CourseContent): FlashcardsData {
  const groups = content.chapters
    .filter((ch) => ch.keyTerms.length > 0)
    .map((ch) => ({
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      cards: ch.keyTerms.map((t) => ({ front: t.term, back: t.definition })),
    }))

  return {
    courseSlug: content.slug,
    courseTitle: content.title,
    totalCards: groups.reduce((sum, g) => sum + g.cards.length, 0),
    groups,
  }
}
