"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Trophy,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { QuizData, QuizQuestion } from "@/src/courses/model/courses"

// Practice quizzes are capped so a 60-question bank stays a focused session.
const QUIZ_SIZE = 12

export function QuizView({ data }: { data: QuizData }) {
  const router = useRouter()
  const base = `/dashboard/courses/${data.courseSlug}`

  const questions: QuizQuestion[] = useMemo(
    () => data.questions.slice(0, QUIZ_SIZE),
    [data.questions],
  )

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  // Per-question chosen option index, so revisiting keeps the answer.
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [finished, setFinished] = useState(false)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  )

  const question = questions[index]
  const answered = selected !== null
  const isLast = index === questions.length - 1

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm text-muted-foreground">
          No questions are available for this chapter yet.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={base}>Back to course</Link>
        </Button>
      </div>
    )
  }

  function choose(optionIndex: number) {
    if (answered) return
    setSelected(optionIndex)
    setAnswers((prev) => ({ ...prev, [index]: optionIndex }))
    if (question.options[optionIndex]?.isCorrect) {
      setScore((s) => s + 1)
    }
  }

  function next() {
    if (isLast) {
      void finish()
      return
    }
    const nextIndex = index + 1
    setIndex(nextIndex)
    setSelected(answers[nextIndex] ?? null)
  }

  function prev() {
    if (index === 0) return
    const prevIndex = index - 1
    setIndex(prevIndex)
    setSelected(answers[prevIndex] ?? null)
  }

  async function finish() {
    setFinished(true)
    setSaveState("saving")
    try {
      const res = await fetch(
        `/api/courses/${data.courseSlug}/chapters/${data.chapterNumber}/quiz/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score, total: questions.length }),
        },
      )
      if (!res.ok) throw new Error()
      setSaveState("saved")
      router.refresh()
    } catch {
      setSaveState("error")
    }
  }

  function retake() {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setAnswers({})
    setFinished(false)
    setSaveState("idle")
  }

  if (finished) {
    return (
      <Results
        score={score}
        total={questions.length}
        base={base}
        chapterNumber={data.chapterNumber}
        saveState={saveState}
        onRetake={retake}
      />
    )
  }

  const correctIndex = question.options.findIndex((o) => o.isCorrect)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <Link
          href={base}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          {index + 1} / {questions.length}
        </span>
      </div>

      <Progress
        value={((index + 1) / questions.length) * 100}
        className="mt-4 h-2"
      />

      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-green-600">
        Chapter {data.chapterNumber} assessment
      </p>
      <h1 className="mt-2 text-xl font-semibold leading-snug text-foreground">
        {question.stem}
      </h1>

      <div className="mt-6 space-y-3">
        {question.options.map((option, i) => {
          const isChosen = selected === i
          const isCorrect = option.isCorrect
          let style =
            "border-border bg-card hover:border-green-300 hover:bg-green-50/40"
          if (answered) {
            if (isCorrect)
              style = "border-green-500 bg-green-50 text-green-900"
            else if (isChosen) style = "border-red-400 bg-red-50 text-red-900"
            else style = "border-border bg-card opacity-70"
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${style}`}
            >
              <span>{option.content}</span>
              {answered && isCorrect && (
                <Check className="h-5 w-5 shrink-0 text-green-600" />
              )}
              {answered && isChosen && !isCorrect && (
                <X className="h-5 w-5 shrink-0 text-red-500" />
              )}
            </button>
          )
        })}
      </div>

      {answered && question.explanation && (
        <div className="mt-5 rounded-xl border border-border bg-muted p-4">
          <p className="text-xs font-semibold text-foreground">
            {selected === correctIndex ? "Correct!" : "Explanation"}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {question.explanation}
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <Button variant="outline" onClick={prev} disabled={index === 0}>
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button variant="brand" onClick={next} disabled={!answered}>
          {isLast ? "Finish" : "Next"}
          {!isLast && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

function Results({
  score,
  total,
  base,
  chapterNumber,
  saveState,
  onRetake,
}: {
  score: number
  total: number
  base: string
  chapterNumber: number
  saveState: "idle" | "saving" | "saved" | "error"
  onRetake: () => void
}) {
  const percent = Math.round((score / total) * 100)
  const passed = percent >= 70

  return (
    <div className="mx-auto max-w-md text-center">
      <div
        className={`mx-auto flex size-16 items-center justify-center rounded-full ${
          passed ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
        }`}
      >
        <Trophy className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-foreground">
        {passed ? "Well done!" : "Keep practicing"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You scored {score} out of {total} on the Chapter {chapterNumber}{" "}
        assessment.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="text-4xl font-bold text-foreground">{percent}%</div>
        <Progress value={percent} className="mt-3 h-2" />
        {saveState === "saving" && (
          <p className="mt-3 text-xs text-muted-foreground">Saving your result…</p>
        )}
        {saveState === "saved" && (
          <p className="mt-3 text-xs text-green-600">Result saved.</p>
        )}
        {saveState === "error" && (
          <p className="mt-3 text-xs text-red-500">
            Couldn’t save your result, but your progress here is correct.
          </p>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <Button variant="brand" className="w-full" onClick={onRetake}>
          <RotateCcw className="h-4 w-4" />
          Retake quiz
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={base}>Back to course</Link>
        </Button>
      </div>
    </div>
  )
}
