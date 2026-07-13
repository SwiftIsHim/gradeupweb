"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import {
  loadCourseSummaries,
  loadCourseDetail,
  loadChapter,
  loadQuiz,
  loadFlashcards,
} from "@/src/courses/data/loadStudyData";
import type {
  CourseSummary,
  CourseDetail,
  ChapterContent,
  QuizData,
  FlashcardsData,
} from "@/src/courses/model/courses";

import { CoursesView } from "./courses";
import { CourseDetailView } from "./course-detail";
import { ChapterReader } from "./chapter-reader";
import { QuizView } from "./quiz";
import { FlashcardsView } from "./flashcards";

/**
 * Client loaders for the study flow. Each one reads course *content* from
 * WatermelonDB (seeded from the local JSON on first use), fetches the user's
 * *progress* from the backend, merges them, and renders the matching view.
 * The course pages stay server components for the dashboard shell and hand off
 * the content area to these.
 */

type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "notFound" }
  | { status: "ready"; data: T };

function useStudyData<T>(
  load: () => Promise<T | null>,
  deps: unknown[],
): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (cancelled) return;
        setState(
          data === null ? { status: "notFound" } : { status: "ready", data },
        );
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
      {children}
    </div>
  );
}

function LoadingState() {
  return (
    <Centered>
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </span>
    </Centered>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Centered>
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        {message}
      </p>
    </Centered>
  );
}

function NotFoundState() {
  return (
    <Centered>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          We couldn’t find that course or chapter.
        </p>
        <Link
          href="/dashboard/courses"
          className="text-sm font-medium text-green-600 hover:text-green-700"
        >
          Back to courses
        </Link>
      </div>
    </Centered>
  );
}

export function CoursesLoader() {
  const state = useStudyData<CourseSummary[]>(() => loadCourseSummaries(), []);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} />;
  if (state.status === "notFound") return <NotFoundState />;
  return <CoursesView courses={state.data} />;
}

export function CourseDetailLoader({ slug }: { slug: string }) {
  const state = useStudyData<CourseDetail>(
    () => loadCourseDetail(slug),
    [slug],
  );

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} />;
  if (state.status === "notFound") return <NotFoundState />;
  return <CourseDetailView course={state.data} />;
}

export function ChapterLoader({
  slug,
  chapterNumber,
}: {
  slug: string;
  chapterNumber: number;
}) {
  const state = useStudyData<ChapterContent>(
    () => loadChapter(slug, chapterNumber),
    [slug, chapterNumber],
  );

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} />;
  if (state.status === "notFound") return <NotFoundState />;
  return <ChapterReader chapter={state.data} />;
}

export function QuizLoader({
  slug,
  chapterNumber,
}: {
  slug: string;
  chapterNumber: number;
}) {
  const state = useStudyData<QuizData>(
    () => loadQuiz(slug, chapterNumber),
    [slug, chapterNumber],
  );

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} />;
  if (state.status === "notFound") return <NotFoundState />;
  return <QuizView data={state.data} />;
}

export function FlashcardsLoader({ slug }: { slug: string }) {
  const state = useStudyData<FlashcardsData>(
    () => loadFlashcards(slug),
    [slug],
  );

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} />;
  if (state.status === "notFound") return <NotFoundState />;
  return <FlashcardsView data={state.data} />;
}
