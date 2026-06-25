import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Target,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { TestsHubData } from "@/src/tests/data/loadTests"
import type { TestSummary } from "@/src/tests/model/tests"

/**
 * The Tests hub: a stats banner, the available tests, and a list of the user's
 * most recent attempts. Course/test content is local; attempts come from the
 * backend — both are loaded by the client loader and passed in here.
 */
export function TestsHubView({ data }: { data: TestsHubData }) {
  const { tests, stats, recentAttempts } = data
  const titleBySlug = new Map(tests.map((t) => [t.slug, t.title]))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practice with timed assessments and track your progress.
        </p>
      </div>

      {/* Stats banner */}
      <section className="overflow-hidden rounded-2xl bg-[#1c2620] text-white">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-400">
              {stats.testsTaken > 0 ? "You're tracking strong" : "Get started"}
            </p>
            <h2 className="mt-2 text-xl font-bold">
              {stats.testsTaken > 0
                ? `${stats.testsTaken} ${stats.testsTaken === 1 ? "test" : "tests"} completed`
                : "Take your first practice test"}
            </h2>
            <p className="mt-1 max-w-md text-sm text-neutral-400">
              {stats.testsTaken > 0
                ? "Keep practicing to push your readiness higher."
                : "Sit a timed test to see where you stand."}
            </p>
          </div>

          <div className="flex gap-8">
            <Stat label="Tests" value={String(stats.testsTaken)} />
            <Stat
              label="Avg score"
              value={stats.averageScore === null ? "—" : `${stats.averageScore}%`}
            />
            <Stat
              label="Best"
              value={stats.bestScore === null ? "—" : `${stats.bestScore}%`}
            />
          </div>
        </div>
      </section>

      {/* Available tests */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Available tests
        </h2>
        {tests.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No tests are available yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <TestCard key={test.slug} test={test} />
            ))}
          </div>
        )}
      </section>

      {/* Recently completed */}
      {recentAttempts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Recently completed
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {recentAttempts.map((attempt) => {
              const passed = attempt.percent >= 70
              return (
                <li
                  key={attempt.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                      passed
                        ? "bg-green-100 text-green-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {titleBySlug.get(attempt.testSlug) ?? attempt.testSlug}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attempt.score}/{attempt.total} correct ·{" "}
                      {formatDate(attempt.takenAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {attempt.percent}%
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-neutral-400">{label}</div>
    </div>
  )
}

function TestCard({ test }: { test: TestSummary }) {
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <span className="inline-flex rounded-lg bg-green-500/10 p-3 text-green-600">
          <FileText className="h-6 w-6" />
        </span>
        {test.bestScore !== null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
            <TrendingUp className="h-3.5 w-3.5" />
            Best {test.bestScore}%
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-foreground">{test.title}</h3>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Target className="h-3.5 w-3.5" />
          {test.questionCount} questions
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {test.timeLimitMinutes} min
        </span>
      </div>

      {test.attemptCount > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Last score</span>
            <span className="font-medium text-foreground">{test.lastScore}%</span>
          </div>
          <Progress value={test.lastScore ?? 0} className="h-2" />
        </div>
      )}

      <Button asChild variant="brand" className="mt-5 w-full">
        <Link href={`/dashboard/tests/${test.slug}/take`}>
          {test.attemptCount > 0 ? "Retake test" : "Start test"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}
