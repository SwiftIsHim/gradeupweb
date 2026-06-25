import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  LayoutGrid,
  ChevronRight,
} from "lucide-react"

import { Progress } from "@/components/ui/progress"
import type { CourseDetail } from "@/src/courses/model/courses"

/**
 * Course detail: the course header with progress, three entry points
 * (Study guide / Flashcards / Quizzes), and the full chapter list with
 * per-chapter Read and Quiz actions.
 */
export function CourseDetailView({ course }: { course: CourseDetail }) {
  const base = `/dashboard/courses/${course.slug}`
  const resumeChapter = course.lastChapterNumber ?? 1

  const modes = [
    {
      name: "Study guide",
      description: "Read each chapter with highlights and key terms.",
      icon: BookOpen,
      href: `${base}/read/${resumeChapter}`,
    },
    {
      name: "Flashcards",
      description: "Review the key terms across every chapter.",
      icon: LayoutGrid,
      href: `${base}/flashcards`,
    },
    {
      name: "Quizzes",
      description: "Test yourself with practice questions.",
      icon: HelpCircle,
      href: `${base}/quiz/1`,
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/dashboard/courses"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
        {course.description && (
          <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
        )}

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>
              {course.chaptersCompleted} of {course.totalChapters} chapters
              complete
            </span>
            <span className="font-medium text-foreground">
              {course.progress}%
            </span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
      </div>

      {/* Entry points */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {modes.map((mode) => (
          <Link
            key={mode.name}
            href={mode.href}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-green-300 hover:shadow-md"
          >
            <span className="mb-3 inline-flex w-fit rounded-lg bg-green-500/10 p-2.5 text-green-600">
              <mode.icon className="h-5 w-5" />
            </span>
            <h3 className="text-sm font-semibold text-foreground">{mode.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{mode.description}</p>
          </Link>
        ))}
      </div>

      {/* Chapters */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Chapters</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {course.chapters.map((ch) => (
            <li
              key={ch.chapterNumber}
              className="flex items-center gap-4 px-5 py-4"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  ch.completed
                    ? "bg-green-100 text-green-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {ch.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  ch.chapterNumber
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {ch.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ch.questionCount} questions · {ch.keyTermCount} key terms
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`${base}/read/${ch.chapterNumber}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  {ch.completed ? "Review" : "Read"}
                </Link>
                <Link
                  href={`${base}/quiz/${ch.chapterNumber}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600"
                >
                  Quiz
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
