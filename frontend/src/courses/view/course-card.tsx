import Link from "next/link"
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import type { CourseSummary } from "@/src/courses/model/courses"

/**
 * A course tile on the Study hub. By default it links into the course detail
 * page; pass `href` + `cta` to point it straight at a resource (study guide,
 * flashcards, quiz) for the "Explore" flow.
 */
export function CourseCard({
  course,
  href,
  cta,
}: {
  course: CourseSummary
  href?: string
  cta?: string
}) {
  const isComplete =
    course.totalChapters > 0 &&
    course.chaptersCompleted >= course.totalChapters
  const target = href ?? `/dashboard/courses/${course.slug}`

  return (
    <Link
      href={target}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-green-300 hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="inline-flex rounded-lg bg-green-500/10 p-3 text-green-600">
          <BookOpen className="h-6 w-6" />
        </span>
        {isComplete && (
          <span className="rounded-full bg-green-100 p-1 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        )}
      </div>

      <h3 className="mb-4 text-sm font-semibold text-foreground">
        {course.title}
      </h3>

      <div className="mt-auto space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>

        {cta ? (
          <span className="inline-flex items-center gap-1 border-t border-border pt-3 text-sm font-medium text-green-600">
            {cta}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : (
          <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
            <div className="text-center">
              <div className="text-xs font-semibold text-foreground">
                {course.totalChapters}
              </div>
              <div className="text-xs text-muted-foreground">Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-foreground">
                {course.questionCount}
              </div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
