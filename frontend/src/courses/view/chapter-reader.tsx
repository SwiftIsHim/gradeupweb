"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Target,
  BookMarked,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type {
  ChapterContent,
  ChapterSection,
} from "@/src/courses/model/courses"

/** Render a single content section (heading / paragraph / list). */
function SectionBlock({ section }: { section: ChapterSection }) {
  if (section.type === "heading") {
    const level = section.level ?? 2
    const cls =
      level <= 1
        ? "mt-8 text-xl font-bold text-foreground"
        : level === 2
          ? "mt-6 text-lg font-semibold text-foreground"
          : "mt-4 text-base font-semibold text-foreground"
    return <h2 className={cls}>{section.title}</h2>
  }

  if (section.type === "paragraph") {
    return (
      <p className="mt-4 text-[15px] leading-7 text-foreground">
        {section.content}
      </p>
    )
  }

  if (section.type === "list") {
    const ordered = section.listType === "numbered"
    const Tag = ordered ? "ol" : "ul"
    return (
      <Tag
        className={`mt-4 space-y-2 pl-5 text-[15px] leading-7 text-foreground ${
          ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {section.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Tag>
    )
  }

  return null
}

export function ChapterReader({ chapter }: { chapter: ChapterContent }) {
  const router = useRouter()
  const base = `/dashboard/courses/${chapter.courseSlug}`
  const [completed, setCompleted] = useState(chapter.completed)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  async function handleComplete() {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/courses/${chapter.courseSlug}/chapters/${chapter.chapterNumber}/complete`,
        { method: "POST" },
      )
      const payload = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(payload.error ?? "Could not save progress.")
      setCompleted(true)
      setShowModal(true)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  function goNext() {
    if (chapter.nextChapter) {
      router.push(`${base}/read/${chapter.nextChapter}`)
    } else {
      router.push(base)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <Link
        href={base}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {chapter.courseTitle}
      </Link>

      {/* Title */}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
          Chapter {chapter.chapterNumber}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          {chapter.title}
        </h1>
      </div>

      {/* Learning objectives */}
      {chapter.learningObjectives.length > 0 && (
        <div className="mt-6 rounded-xl border border-green-100 bg-green-50/60 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-800">
            <Target className="h-4 w-4" />
            Learning objectives
          </div>
          <ul className="space-y-2">
            {chapter.learningObjectives.map((obj, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm leading-6 text-green-900/80"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-green-500" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reading content */}
      <article className="mt-2">
        {chapter.sections.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}
      </article>

      {/* Key terms */}
      {chapter.keyTerms.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookMarked className="h-4 w-4 text-green-600" />
            Key terms
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {chapter.keyTerms.map((term, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-4"
              >
                <dt className="text-sm font-semibold text-foreground">
                  {term.term}
                </dt>
                <dd className="mt-1 text-xs leading-5 text-muted-foreground">
                  {term.definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Footer nav */}
      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        {chapter.prevChapter ? (
          <Button asChild variant="outline">
            <Link href={`${base}/read/${chapter.prevChapter}`}>
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Link>
          </Button>
        ) : (
          <span />
        )}

        {completed ? (
          <Button variant="brand" onClick={() => setShowModal(true)}>
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </Button>
        ) : (
          <Button variant="brand" onClick={handleComplete} disabled={saving}>
            {saving ? "Saving…" : "Mark complete"}
          </Button>
        )}
      </div>

      {showModal && (
        <ChapterCompleteModal
          chapterNumber={chapter.chapterNumber}
          hasNext={chapter.nextChapter !== null}
          onTakeAssessment={() =>
            router.push(`${base}/quiz/${chapter.chapterNumber}`)
          }
          onContinue={() => {
            setShowModal(false)
            goNext()
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function ChapterCompleteModal({
  chapterNumber,
  hasNext,
  onTakeAssessment,
  onContinue,
  onClose,
}: {
  chapterNumber: number
  hasNext: boolean
  onTakeAssessment: () => void
  onContinue: () => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Chapter Complete!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You finished Chapter {chapterNumber}. Ready to test your knowledge?
        </p>

        <div className="mt-6 space-y-2">
          <Button variant="brand" className="w-full" onClick={onTakeAssessment}>
            Take Assessment
          </Button>
          <Button variant="outline" className="w-full" onClick={onContinue}>
            {hasNext ? "Continue Reading" : "Back to course"}
            {hasNext && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
