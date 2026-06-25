/**
 * Domain types for the study flow (courses, chapters, flashcards, quizzes) plus
 * the static "Explore" resource cards.
 *
 * Course *content* is read from the local JSON files (see
 * ../data/normalizeCourse + app/api/courses/content) and stored on the client
 * in WatermelonDB (see ../db). User *progress* still comes from the backend
 * (see ../repository/coursesRepository). The view-facing shapes below
 * (CourseSummary, CourseDetail, ChapterContent, QuizData, FlashcardsData) are
 * assembled on the client by merging content with progress.
 */

export type StudyMode = "study" | "explore";

// ── Catalog ─────────────────────────────────────────────────────────────────

export interface CourseSummary {
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  totalChapters: number;
  questionCount: number;
  chaptersCompleted: number;
  progress: number;
}

// ── Course detail + chapters ─────────────────────────────────────────────────

export interface ChapterSummary {
  chapterNumber: number;
  title: string;
  objectiveCount: number;
  keyTermCount: number;
  questionCount: number;
  completed: boolean;
}

export interface CourseDetail {
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  totalChapters: number;
  totalPages: number;
  chaptersCompleted: number;
  progress: number;
  lastChapterNumber: number | null;
  chapters: ChapterSummary[];
}

// ── Chapter reading content ──────────────────────────────────────────────────

export interface HeadingSection {
  type: "heading";
  title: string;
  level: number;
  content?: unknown[];
}
export interface ParagraphSection {
  type: "paragraph";
  content: string;
}
export interface ListSection {
  type: "list";
  listType: "numbered" | "bulleted" | string;
  items: string[];
}
export type ChapterSection =
  | HeadingSection
  | ParagraphSection
  | ListSection;

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface ChapterContent {
  courseSlug: string;
  courseTitle: string;
  chapterNumber: number;
  title: string;
  sections: ChapterSection[];
  learningObjectives: string[];
  keyTerms: KeyTerm[];
  questionCount: number;
  completed: boolean;
  prevChapter: number | null;
  nextChapter: number | null;
}

// ── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizOption {
  content: string;
  isCorrect: boolean;
}
export interface QuizQuestion {
  id: string;
  stem: string;
  explanation: string;
  difficulty: number;
  options: QuizOption[];
}
export interface QuizData {
  courseSlug: string;
  chapterNumber: number;
  questions: QuizQuestion[];
}

// ── Flashcards ───────────────────────────────────────────────────────────────

export interface Flashcard {
  front: string;
  back: string;
}
export interface FlashcardGroup {
  chapterNumber: number;
  title: string;
  cards: Flashcard[];
}
export interface FlashcardsData {
  courseSlug: string;
  courseTitle: string;
  totalCards: number;
  groups: FlashcardGroup[];
}

// ── Progress (returned by mutations) ─────────────────────────────────────────

export interface QuizResult {
  chapterNumber: number;
  score: number;
  total: number;
  takenAt: string;
}
export interface CourseProgress {
  chaptersCompleted: number[];
  progress: number;
  lastChapterNumber: number | null;
  quizResults: QuizResult[];
}

// ── Raw progress (as returned by the backend, before merging with content) ───

/**
 * One course's progress exactly as the backend stores it: chapter numbers
 * completed and per-chapter quiz results, keyed by slug. Percentages and
 * "completed" flags are derived on the client by merging with content.
 */
export interface RawProgress {
  courseSlug: string;
  chaptersCompleted: number[];
  lastChapterNumber: number | null;
  quizResults: QuizResult[];
}

// ── Course content (read from local JSON, seeded into WatermelonDB) ──────────

export interface ContentOption {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}
export interface ContentQuestion {
  chapterNumber: number;
  stem: string;
  explanation: string;
  difficulty: number;
  options: ContentOption[];
}
export interface ContentChapter {
  chapterNumber: number;
  title: string;
  sections: ChapterSection[];
  learningObjectives: string[];
  keyTerms: KeyTerm[];
}
export interface CourseContent {
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  totalChapters: number;
  totalPages: number;
  chapters: ContentChapter[];
  questions: ContentQuestion[];
}

/** Response of GET /api/courses/content: all courses + a content version. */
export interface CourseContentPayload {
  version: string;
  courses: CourseContent[];
}

// ── Static "Explore" resource cards (shown on the Study hub) ─────────────────

export type ResourceId = "guides" | "flashcards" | "quizzes";

export interface StudyResource {
  id: ResourceId;
  name: string;
  description: string;
  icon: string;
  /** Short call-to-action shown on a course tile in the Explore flow. */
  cta: string;
}

export const STUDY_RESOURCES: StudyResource[] = [
  {
    id: "guides",
    name: "Study Guides",
    description: "Read each chapter with highlights and key terms.",
    icon: "BookOpen",
    cta: "Open study guide",
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Quick recall of the key terms in each topic.",
    icon: "LayoutGrid",
    cta: "Review flashcards",
  },
  {
    id: "quizzes",
    name: "Quizzes",
    description: "Test your knowledge with practice questions.",
    icon: "HelpCircle",
    cta: "Start quiz",
  },
];

/**
 * Where an "Explore" resource sends you for a given course. Study guide and
 * quizzes open at chapter 1 (the course detail page resumes the last chapter
 * instead); flashcards span every chapter.
 */
export function resourceHref(slug: string, resource: ResourceId): string {
  switch (resource) {
    case "guides":
      return `/dashboard/courses/${slug}/read/1`;
    case "flashcards":
      return `/dashboard/courses/${slug}/flashcards`;
    case "quizzes":
      return `/dashboard/courses/${slug}/quiz/1`;
  }
}
