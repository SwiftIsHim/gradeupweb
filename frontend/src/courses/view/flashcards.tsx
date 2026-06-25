"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { FlashcardsData } from "@/src/courses/model/courses"

interface Card {
  front: string
  back: string
  chapterTitle: string
}

export function FlashcardsView({ data }: { data: FlashcardsData }) {
  const base = `/dashboard/courses/${data.courseSlug}`

  // 0 = all topics; otherwise a chapterNumber filter.
  const [filter, setFilter] = useState<number>(0)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [order, setOrder] = useState<number[] | null>(null)

  const cards: Card[] = useMemo(() => {
    const groups =
      filter === 0
        ? data.groups
        : data.groups.filter((g) => g.chapterNumber === filter)
    return groups.flatMap((g) =>
      g.cards.map((c) => ({ ...c, chapterTitle: g.title })),
    )
  }, [data.groups, filter])

  // Apply shuffle order if set, else natural order.
  const sequence = order ?? cards.map((_, i) => i)
  const current = cards[sequence[index]] ?? null

  function reset() {
    setIndex(0)
    setFlipped(false)
    setOrder(null)
  }

  function changeFilter(value: number) {
    setFilter(value)
    setIndex(0)
    setFlipped(false)
    setOrder(null)
  }

  function shuffle() {
    const arr = cards.map((_, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setOrder(arr)
    setIndex(0)
    setFlipped(false)
  }

  function go(delta: number) {
    setFlipped(false)
    setIndex((i) => Math.min(Math.max(i + delta, 0), cards.length - 1))
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={base}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {data.courseTitle}
      </Link>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Flashcards</h1>
          <p className="text-sm text-muted-foreground">{data.totalCards} key terms</p>
        </div>
        <Button variant="outline" size="sm" onClick={shuffle}>
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
      </div>

      {/* Topic filter */}
      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip active={filter === 0} onClick={() => changeFilter(0)}>
          All topics
        </FilterChip>
        {data.groups.map((g) => (
          <FilterChip
            key={g.chapterNumber}
            active={filter === g.chapterNumber}
            onClick={() => changeFilter(g.chapterNumber)}
          >
            Ch {g.chapterNumber}
          </FilterChip>
        ))}
      </div>

      {/* Card */}
      {current ? (
        <>
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {index + 1} / {cards.length}
            </span>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restart
            </button>
          </div>

          <button
            onClick={() => setFlipped((f) => !f)}
            className="mt-3 flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition hover:shadow-md"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
              {flipped ? "Definition" : "Term"}
            </span>
            <span className="mt-4 text-lg font-medium text-foreground">
              {flipped ? current.back : current.front}
            </span>
            <span className="mt-6 text-xs text-muted-foreground">
              Click to {flipped ? "see term" : "reveal definition"}
            </span>
          </button>

          <div className="mt-5 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => go(-1)}
              disabled={index === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="truncate px-3 text-xs text-muted-foreground">
              {current.chapterTitle}
            </span>
            <Button
              variant="brand"
              onClick={() => go(1)}
              disabled={index >= cards.length - 1}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No flashcards for this topic.
        </p>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-green-500 text-white"
          : "border border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  )
}
