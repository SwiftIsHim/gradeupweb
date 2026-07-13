"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Minus,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { submitAttemptClient } from "@/src/tests/data/attemptsClient"
import type { SubmitAttemptPayload } from "@/src/tests/data/attemptsClient"
import type {
  TestContent,
  AttemptAnswer,
} from "@/src/tests/model/tests"

type Phase = "taking" | "done"
type SaveState = "idle" | "saving" | "saved" | "error"

interface Result {
  score: number
  total: number
  percent: number
  answers: AttemptAnswer[]
}

/** mm:ss for a non-negative number of seconds. */
function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const mm = String(Math.floor(s / 60)).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return `${mm}:${ss}`
}

export function TestRunner({
  test,
  backHref = "/dashboard/tests",
  backLabel = "Back to tests",
  submitAttempt = submitAttemptClient,
}: {
  test: TestContent
  /** Where "Exit" / "Back to tests" navigate — lets other sections (e.g. the diagnostic) reuse this runner. */
  backHref?: string
  backLabel?: string
  submitAttempt?: (slug: string, payload: SubmitAttemptPayload) => Promise<unknown>
}) {
  const questions = test.questions
  const total = questions.length
  const timeLimit = test.timeLimitMinutes * 60

  const [phase, setPhase] = useState<Phase>("taking")
  const [index, setIndex] = useState(0)
  // questionIndex → selected option key
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [result, setResult] = useState<Result | null>(null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  // Guards against a double submit (StrictMode, or the timer firing as the
  // user also clicks "Submit"). Reset on retake.
  const submittedRef = useRef(false)

  const grade = useCallback((): Result => {
    const graded: AttemptAnswer[] = questions.map((q) => {
      const selectedKey = answers[q.index] ?? null
      return {
        questionIndex: q.index,
        selectedKey,
        correctKey: q.answerKey,
        isCorrect: selectedKey === q.answerKey,
      }
    })
    const score = graded.filter((a) => a.isCorrect).length
    const percent = total ? Math.round((score / total) * 100) : 0
    return { score, total, percent, answers: graded }
  }, [answers, questions, total])

  const finish = useCallback(() => {
    // Only submit once — side effects must not live inside a setState updater,
    // since React invokes those twice in development (StrictMode).
    if (submittedRef.current) return
    submittedRef.current = true

    const graded = grade()
    setResult(graded)
    setPhase("done")
    setSaveState("saving")

    const durationSeconds = timeLimit - timeLeft
    submitAttempt(test.slug, {
      score: graded.score,
      total: graded.total,
      durationSeconds,
      answers: graded.answers,
    })
      .then((saved) => setSaveState(saved ? "saved" : "error"))
      .catch(() => setSaveState("error"))
  }, [grade, submitAttempt, test.slug, timeLeft, timeLimit])

  // Countdown timer; auto-submits at zero.
  useEffect(() => {
    if (phase !== "taking") return
    if (timeLeft <= 0) {
      finish()
      return
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [phase, timeLeft, finish])

  if (total === 0) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm text-muted-foreground">
          This test has no questions yet.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/tests">Back to tests</Link>
        </Button>
      </div>
    )
  }

  if (phase === "done" && result) {
    return (
      <Results
        test={test}
        result={result}
        saveState={saveState}
        backHref={backHref}
        backLabel={backLabel}
        onRetake={() => {
          submittedRef.current = false
          setAnswers({})
          setIndex(0)
          setTimeLeft(timeLimit)
          setResult(null)
          setSaveState("idle")
          setPhase("taking")
        }}
      />
    )
  }

  return (
    <Taking
      test={test}
      index={index}
      setIndex={setIndex}
      answers={answers}
      setAnswers={setAnswers}
      timeLeft={timeLeft}
      onSubmit={finish}
      lowTime={timeLeft <= 60}
      backHref={backHref}
    />
  )
}

function Taking({
  test,
  index,
  setIndex,
  answers,
  setAnswers,
  timeLeft,
  onSubmit,
  lowTime,
  backHref,
}: {
  test: TestContent
  index: number
  setIndex: (i: number) => void
  answers: Record<number, string>
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>
  timeLeft: number
  onSubmit: () => void
  lowTime: boolean
  backHref: string
}) {
  const questions = test.questions
  const total = questions.length
  const question = questions[index]
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.index] !== undefined).length,
    [questions, answers],
  )
  const isLast = index === total - 1
  const selected = answers[question.index] ?? null

  function choose(key: string) {
    setAnswers((prev) => ({ ...prev, [question.index]: key }))
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit
        </Link>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ${
            lowTime
              ? "bg-red-50 text-red-600"
              : "bg-muted text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          {formatTime(timeLeft)}
        </span>
      </div>

      <Progress
        value={((index + 1) / total) * 100}
        className="mt-4 h-2"
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_260px]">
        {/* Question */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
            Question {index + 1} of {total}
          </p>
          <h1 className="mt-2 text-xl font-semibold leading-snug text-foreground">
            {question.prompt}
          </h1>

          <div className="mt-6 space-y-3">
            {question.options.map((option) => {
              const isChosen = selected === option.key
              return (
                <button
                  key={option.key}
                  onClick={() => choose(option.key)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                    isChosen
                      ? "border-green-500 bg-green-50 text-green-900"
                      : "border-border bg-card hover:border-green-300 hover:bg-green-50/40"
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isChosen
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {option.key}
                  </span>
                  <span>{option.content}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <Button
              variant="outline"
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            {isLast ? (
              <Button variant="brand" onClick={onSubmit}>
                Submit test
              </Button>
            ) : (
              <Button
                variant="brand"
                onClick={() => setIndex(Math.min(total - 1, index + 1))}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigator */}
        <aside className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Questions</span>
            <span>
              {answeredCount}/{total} answered
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2 lg:grid-cols-5">
            {questions.map((q, i) => {
              const isAnswered = answers[q.index] !== undefined
              const isCurrent = i === index
              return (
                <button
                  key={q.index}
                  onClick={() => setIndex(i)}
                  className={`flex aspect-square items-center justify-center rounded-md text-xs font-medium transition ${
                    isCurrent
                      ? "bg-[#1c2620] text-white"
                      : isAnswered
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <Button
            variant="brand"
            className="mt-4 w-full"
            onClick={onSubmit}
          >
            Submit test
          </Button>
        </aside>
      </div>
    </div>
  )
}

// Outcome of a single question in the breakdown.
type QStatus = "correct" | "incorrect" | "skipped"

const STATUS_META: Record<
  QStatus,
  { label: string; badge: string; pill: string; dot: string; Icon: LucideIcon }
> = {
  correct: {
    label: "Correct",
    badge: "bg-green-100 text-green-600",
    pill: "bg-green-50 text-green-700",
    dot: "bg-green-500",
    Icon: Check,
  },
  incorrect: {
    label: "Incorrect",
    badge: "bg-red-100 text-red-500",
    pill: "bg-red-50 text-red-600",
    dot: "bg-red-500",
    Icon: X,
  },
  skipped: {
    label: "Skipped",
    badge: "bg-muted text-muted-foreground",
    pill: "bg-muted text-muted-foreground",
    dot: "bg-neutral-400",
    Icon: Minus,
  },
}

function Results({
  test,
  result,
  saveState,
  onRetake,
  backHref,
  backLabel,
}: {
  test: TestContent
  result: Result
  saveState: SaveState
  onRetake: () => void
  backHref: string
  backLabel: string
}) {
  const passed = result.percent >= 70

  const [filter, setFilter] = useState<"all" | QStatus>("all")

  const gradedByIndex = useMemo(
    () => new Map(result.answers.map((a) => [a.questionIndex, a])),
    [result.answers],
  )
  const statusOf = (questionIndex: number): QStatus => {
    const g = gradedByIndex.get(questionIndex)
    if (g?.isCorrect) return "correct"
    if (!g || g.selectedKey === null) return "skipped"
    return "incorrect"
  }
  const counts = {
    correct: result.answers.filter((a) => a.isCorrect).length,
    incorrect: result.answers.filter(
      (a) => !a.isCorrect && a.selectedKey !== null,
    ).length,
    skipped: result.answers.filter((a) => a.selectedKey === null).length,
  }
  const filters: { key: "all" | QStatus; label: string; count: number }[] = [
    { key: "all", label: "All", count: result.total },
    { key: "correct", label: "Correct", count: counts.correct },
    { key: "incorrect", label: "Incorrect", count: counts.incorrect },
    { key: "skipped", label: "Skipped", count: counts.skipped },
  ]
  const visibleQuestions = test.questions.filter(
    (q) => filter === "all" || statusOf(q.index) === filter,
  )

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
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
          You scored {result.score} out of {result.total} on {test.title}.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border bg-card p-6 text-center">
        <div className="text-4xl font-bold text-foreground">{result.percent}%</div>
        <Progress value={result.percent} className="mt-3 h-2" />
        {saveState === "saving" && (
          <p className="mt-3 text-xs text-muted-foreground">Saving your result…</p>
        )}
        {saveState === "saved" && (
          <p className="mt-3 text-xs text-green-600">Result saved.</p>
        )}
        {saveState === "error" && (
          <p className="mt-3 text-xs text-red-500">
            Couldn’t save your result, but your score here is correct.
          </p>
        )}
      </div>

      {/* Per-question breakdown */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Question breakdown
        </h2>

        {/* Summary + filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-[#1c2620] text-white"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.key !== "all" && (
                  <span
                    className={`size-1.5 rounded-full ${STATUS_META[f.key].dot}`}
                  />
                )}
                {f.label}
                <span className={active ? "text-white/70" : "text-muted-foreground"}>
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>

        {visibleQuestions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No {filter} questions.
          </p>
        ) : (
          <ul className="space-y-3">
            {visibleQuestions.map((q) => {
              const graded = gradedByIndex.get(q.index)
              const status = statusOf(q.index)
              const meta = STATUS_META[status]
              const selectedOption = q.options.find(
                (o) => o.key === (graded?.selectedKey ?? null),
              )
              const correctOption = q.options.find((o) => o.key === q.answerKey)
              return (
                <li
                  key={q.index}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${meta.badge}`}
                      >
                        {q.index + 1}
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        {q.prompt}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.pill}`}
                    >
                      <meta.Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 sm:pl-9">
                    {status !== "correct" && (
                      <div className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-700">
                        <span className="font-semibold">Your answer: </span>
                        {selectedOption
                          ? `${selectedOption.key}. ${selectedOption.content}`
                          : "Not answered"}
                      </div>
                    )}
                    <div className="rounded-lg border border-green-200 bg-green-50/60 px-3 py-2 text-xs text-green-800">
                      <span className="font-semibold">Correct answer: </span>
                      {correctOption
                        ? `${correctOption.key}. ${correctOption.content}`
                        : q.answerKey}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="brand" onClick={onRetake}>
          Retake test
        </Button>
        <Button asChild variant="outline">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
