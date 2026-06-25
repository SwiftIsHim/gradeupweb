"use client"

import { useEffect, useState } from "react"
import { BookOpen, HelpCircle, Layers } from "lucide-react"

import { cn } from "@/lib/utils"
import { queryCatalog, queryFlashcardTotal } from "@/src/courses/db/queries"
import { fetchAllAttemptsClient } from "@/src/tests/data/attemptsClient"
import { profilePlaceholder } from "@/src/dashboard/model/dashboard"

/**
 * The profile "Library" card, synced to real data: Study Guides = courses
 * available, Flashcards = total key terms across courses, Quizzes = test
 * attempts taken. Course content lives in WatermelonDB (client-only) and
 * attempts come from the backend, so this is a client island. Counts show "—"
 * until loaded.
 */
export function ProfileLibrary() {
  const [counts, setCounts] = useState<{
    studyGuides: number
    flashcards: number
    quizzes: number
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      queryCatalog(),
      queryFlashcardTotal(),
      fetchAllAttemptsClient(),
    ])
      .then(([catalog, flashcards, attempts]) => {
        if (cancelled) return
        setCounts({
          studyGuides: catalog.length,
          flashcards,
          quizzes: attempts.length,
        })
      })
      .catch(() => {
        if (!cancelled) setCounts({ studyGuides: 0, flashcards: 0, quizzes: 0 })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const items = [
    { icon: BookOpen, label: "Study Guides", value: counts?.studyGuides },
    { icon: Layers, label: "Flashcards", value: counts?.flashcards },
    { icon: HelpCircle, label: "Quizzes", value: counts?.quizzes },
  ]

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap gap-2">
        {profilePlaceholder.libraryTabs.map((tab, index) => (
          <span
            key={tab}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              index === 0
                ? "bg-[#1c2620] text-white"
                : "border border-border text-muted-foreground",
            )}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-green-600">
              <item.icon className="size-4" />
            </span>
            <div>
              <p className="text-lg font-bold leading-none">
                {item.value === undefined ? "—" : item.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
