"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Loader2 } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { loadCourseSummaries } from "@/src/courses/data/loadStudyData"
import type { CourseSummary } from "@/src/courses/model/courses"

/**
 * The dashboard's "Continue learning" section. Course content lives in
 * WatermelonDB on the client, so this is a client island that loads the
 * catalog + progress itself rather than receiving it as a server prop.
 */
export function ContinueLearning() {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null)

  useEffect(() => {
    let cancelled = false
    loadCourseSummaries()
      .then((data) => {
        if (!cancelled) setCourses(data)
      })
      .catch(() => {
        if (!cancelled) setCourses([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Surface in-progress courses first; if none are started, show what's available.
  const inProgress = (courses ?? []).filter(
    (c) => c.chaptersCompleted > 0 && c.progress < 100,
  )
  const shown = (inProgress.length > 0 ? inProgress : courses ?? []).slice(0, 3)

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          Continue learning
        </h2>
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
        >
          See all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {courses === null ? (
        <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your courses…
          </span>
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10">
          <p className="py-2 text-center text-sm text-muted-foreground">
            Your in-progress lessons will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {shown.map((course) => (
            <CourseProgressCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </section>
  )
}

function CourseProgressCard({ course }: { course: CourseSummary }) {
  const started = course.chaptersCompleted > 0
  return (
    <Link
      href={`/dashboard/courses/${course.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-green-300 hover:shadow-md"
    >
      <span className="mb-3 inline-flex w-fit rounded-lg bg-green-500/10 p-2.5 text-green-600">
        <BookOpen className="size-5" />
      </span>
      <h3 className="text-sm font-semibold text-foreground">{course.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {course.chaptersCompleted} of {course.totalChapters} chapters
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium text-foreground">{course.progress}%</span>
        </div>
        <Progress value={course.progress} className="h-2" />
      </div>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-green-600">
        {started ? "Continue" : "Start course"}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
