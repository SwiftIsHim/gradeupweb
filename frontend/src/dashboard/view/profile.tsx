import {
  BookOpen,
  Bookmark,
  Clock,
  Flame,
  HelpCircle,
  Highlighter,
  Layers,
  Pencil,
  Settings,
  Share2,
  Target,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/src/dashboard/view/sidebar"
import { LogoutButton } from "@/src/dashboard/view/logout-button"
import { ProfileLibrary } from "@/src/dashboard/view/profile-library"
import { ReadinessScoreValue } from "@/src/dashboard/view/readiness-score"
import {
  profilePlaceholder,
  streakPlaceholder,
  type DashboardHeader,
} from "@/src/dashboard/model/dashboard"

const ICONS = {
  target: Target,
  clock: Clock,
  flame: Flame,
  bookmark: Bookmark,
  highlighter: Highlighter,
  share: Share2,
  book: BookOpen,
  cards: Layers,
  quiz: HelpCircle,
} as const

type IconKey = keyof typeof ICONS

export function Profile({ header }: { header: DashboardHeader }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar header={header} active="profile" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-8 sm:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-6">
            <ProfileHeader header={header} />
            <StatsRow />
            <CountersRow />
            <LearningHistory />
            <ProfileLibrary />
            <LogoutButton />
          </div>
        </main>
      </div>
    </div>
  )
}

function Topbar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-3.5 sm:px-8">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
      >
        <Share2 className="size-4" />
        Share profile
      </button>
      <div className="flex items-center gap-3">
        <Badge variant="brand" className="gap-1.5">
          <Flame className="size-3.5" />
          {streakPlaceholder.days > 0
            ? `${streakPlaceholder.days} day streak`
            : streakPlaceholder.label}
        </Badge>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <Settings className="size-4" />
          Settings
        </button>
      </div>
    </header>
  )
}

function ProfileHeader({ header }: { header: DashboardHeader }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-amber-200 text-2xl font-bold text-amber-800">
        {header.initials}
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{header.fullName}</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Joined {header.joinedYear}
      </p>
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-medium transition hover:bg-muted"
      >
        <Pencil className="size-3.5" />
        Edit
      </button>
    </div>
  )
}

function StatsRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {profilePlaceholder.stats.map((stat) => {
        const Icon = ICONS[stat.icon as IconKey]
        return (
          <div
            key={stat.label}
            className="flex flex-col items-center rounded-2xl border border-border bg-card px-4 py-6 text-center"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-green-600">
              <Icon className="size-5" />
            </span>
            <p className="mt-3 text-3xl font-bold">
              {stat.icon === "target" ? <ReadinessScoreValue /> : stat.value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function CountersRow() {
  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card">
      {profilePlaceholder.counters.map((counter) => {
        const Icon = ICONS[counter.icon as IconKey]
        return (
          <div
            key={counter.label}
            className="flex items-center justify-center gap-3 px-4 py-5"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-muted text-green-600">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-lg font-bold leading-none">{counter.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {counter.label}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LearningHistory() {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">
        {profilePlaceholder.historyTitle}
      </h2>
      <p className="text-sm text-muted-foreground">
        {profilePlaceholder.historySubtitle}
      </p>
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10">
        <p className="text-center text-sm text-muted-foreground">
          {profilePlaceholder.historyEmptyText}
        </p>
      </div>
    </section>
  )
}

