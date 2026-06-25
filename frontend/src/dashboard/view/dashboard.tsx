import Link from "next/link"
import { ArrowRight, Bell, Flame, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/src/theme/theme-toggle"
import { Sidebar } from "@/src/dashboard/view/sidebar"
import { ContinueLearning } from "@/src/dashboard/view/continue-learning"
import {
  recentActivityPlaceholder,
  recommendedPlaceholder,
  streakPlaceholder,
  todayGoalPlaceholder,
  type DashboardHeader,
} from "@/src/dashboard/model/dashboard"

export function Dashboard({ header }: { header: DashboardHeader }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar header={header} active="home" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-6">
              <WelcomeBanner header={header} />
              <ContinueLearning />
              <Recommended />
            </div>
            <div className="flex flex-col gap-6">
              <TodayGoal />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function Topbar() {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3.5 sm:px-8">
      <div className="relative flex-1 sm:max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search topics, chapters, friends…"
          className="w-full rounded-full border border-border bg-muted py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-200"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted"
        >
          <Bell className="size-4" />
        </button>
        <Badge variant="brand" className="gap-1.5">
          <Flame className="size-3.5" />
          {streakPlaceholder.days > 0
            ? `${streakPlaceholder.days} day streak`
            : streakPlaceholder.label}
        </Badge>
      </div>
    </header>
  )
}

function WelcomeBanner({ header }: { header: DashboardHeader }) {
  const days = header.daysToExam
  return (
    <section className="overflow-hidden rounded-2xl bg-[#1c2620] text-white">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-400">
            {header.todayLabel}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Welcome back, {header.firstName} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-400">
            {days !== null
              ? `You're ${days} days from your ${header.examLabel}. Pick up where you left off.`
              : `Let's keep making progress toward your ${header.examLabel}.`}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              asChild
              variant="brand"
              className="h-11 rounded-full px-5 text-sm"
            >
              <Link href="/dashboard/courses">Resume studying</Link>
            </Button>
            <Button
              asChild
              className="h-11 rounded-full border border-green-500/50 bg-transparent px-5 text-sm text-green-400 hover:bg-green-500/10"
            >
              <Link href="/dashboard/courses">View study plan</Link>
            </Button>
          </div>
        </div>

        {days !== null ? <ExamRing days={days} /> : null}
      </div>
    </section>
  )
}

function ExamRing({ days }: { days: number }) {
  return (
    <div className="relative flex size-32 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="size-32 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-white/10"
        />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 44}
          strokeDashoffset={2 * Math.PI * 44 * 0.25}
          className="text-green-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold">{days}</span>
        <span className="text-[11px] text-neutral-400">days to exam</span>
      </div>
    </div>
  )
}

function TodayGoal() {
  const { done, total, caption, ctaLabel } = todayGoalPlaceholder
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold tracking-tight">Today's goal</h2>
      <p className="mt-3 text-3xl font-bold">
        {done} <span className="text-base font-medium text-muted-foreground">of {total} cards</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-green-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <Button
        asChild
        variant="brand"
        className="mt-5 h-11 w-full rounded-full text-sm"
      >
        <Link href="/dashboard/courses">{ctaLabel}</Link>
      </Button>
    </section>
  )
}

function RecentActivity() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          {recentActivityPlaceholder.title}
        </h2>
        <SeeAll href="/dashboard/activity" />
      </div>
      <EmptyState text={recentActivityPlaceholder.emptyText} />
    </section>
  )
}

function Recommended() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          {recommendedPlaceholder.title}
        </h2>
        <SeeAll href="/dashboard/browse" label="Browse all" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {recommendedPlaceholder.tabs.map((tab, index) => (
          <span
            key={tab}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium",
              index === 0
                ? "border-transparent bg-[#1c2620] text-white"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10">
        <EmptyState text={recommendedPlaceholder.emptyText} />
      </div>
    </section>
  )
}

function SeeAll({ href, label = "See all" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
    >
      {label}
      <ArrowRight className="size-3.5" />
    </Link>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-2 text-center text-sm text-muted-foreground">{text}</p>
}
