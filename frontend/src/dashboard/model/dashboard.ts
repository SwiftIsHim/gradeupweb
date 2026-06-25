/**
 * Dashboard content + the mapping from a saved onboarding profile to the
 * personalized header. Study content (Continue learning / Recommended / the
 * Today's goal counts) is intentionally still placeholder — see the `*Placeholder`
 * exports — and will be wired to real study data later.
 */

import type { OnboardingProfile } from "@/src/onboarding/repository/onboardingRepository"

export const brandName = "Grade Up"
export const brandInitial = "G"

export interface NavItem {
  label: string
  href: string
  icon: "home" | "courses" | "tests" | "peers" | "profile"
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "Courses", href: "/dashboard/courses", icon: "courses" },
  { label: "Tests", href: "/dashboard/tests", icon: "tests" },
  { label: "Peers", href: "/dashboard/peers", icon: "peers" },
  { label: "Profile", href: "/dashboard/profile", icon: "profile" },
]

// Onboarding goal → the exam name shown in the welcome banner.
const GOAL_EXAM_LABELS: Record<string, string> = {
  promotion: "Promotion exam",
  confirmation: "Confirmation exam",
  conversion: "Conversion exam",
  general: "Civil Service exam",
}

// schedule value → human label (mirrors the onboarding model).
const SCHEDULE_LABELS: Record<string, string> = {
  "weekday-mornings": "weekday mornings",
  "weekday-evenings": "weekday evenings",
  weekends: "weekends",
  flexible: "flexible hours",
}

const DAY_MS = 1000 * 60 * 60 * 24

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export interface DashboardHeader {
  firstName: string
  /** "Samuel Adekunle" — full name for the profile header. */
  fullName: string
  /** "Samuel A." — first name + last initial, for the sidebar account row. */
  shortName: string
  avatarInitial: string
  /** "SA" — first + last initial, for the profile avatar. */
  initials: string
  /** Year the user finished onboarding, e.g. "2026". */
  joinedYear: string
  /** "TUESDAY · MAY 10" */
  todayLabel: string
  examLabel: string
  daysToExam: number | null
  dailyGoalLabel: string
}

/** Build the personalized header from the onboarding profile + today's date. */
export function toDashboardHeader(profile: OnboardingProfile): DashboardHeader {
  const firstName = profile.firstName?.trim() || "there"
  const lastName = profile.lastName?.trim() || ""
  const lastInitial = lastName[0]
  const shortName = lastInitial ? `${firstName} ${lastInitial}.` : firstName
  const fullName = lastName ? `${firstName} ${lastName}` : firstName
  const initials = `${firstName[0] ?? ""}${lastInitial ?? ""}`.toUpperCase() || "?"

  const joinedYear = profile.completedAt
    ? String(new Date(profile.completedAt).getFullYear())
    : String(new Date().getFullYear())

  const now = new Date()
  const todayLabel = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase()
    .replace(",", " ·")

  let daysToExam: number | null = null
  if (profile.examDate) {
    const exam = new Date(profile.examDate)
    if (!Number.isNaN(exam.getTime())) {
      daysToExam = Math.max(
        0,
        Math.round((exam.getTime() - startOfToday().getTime()) / DAY_MS),
      )
    }
  }

  const minutes = profile.dailyMinutes ? `${profile.dailyMinutes} min/day` : "Daily goal"
  const schedule = SCHEDULE_LABELS[profile.schedule] ?? null
  const dailyGoalLabel = schedule ? `${minutes} · ${schedule}` : minutes

  return {
    firstName,
    fullName,
    shortName,
    avatarInitial: firstName[0]?.toUpperCase() ?? "?",
    initials,
    joinedYear,
    todayLabel,
    examLabel: GOAL_EXAM_LABELS[profile.goal] ?? "Civil Service exam",
    daysToExam,
    dailyGoalLabel,
  }
}

// ── Placeholders (study data not wired yet) ─────────────────────────────────

export const todayGoalPlaceholder = {
  done: 0,
  total: 20,
  caption: "Your daily study target will appear here.",
  ctaLabel: "Start studying",
}

export const recentActivityPlaceholder = {
  title: "Recent activity",
  emptyText: "Your recent activity will show up here once you start studying.",
}

export const continueLearningPlaceholder = {
  title: "Continue learning",
  emptyText: "Your in-progress lessons will appear here.",
}

export const recommendedPlaceholder = {
  title: "Recommended for you",
  tabs: ["All Topics", "Flashcards", "Practice Tests", "Study Guides", "Diagnostic"],
  emptyText: "Personalized recommendations are on the way.",
}

export const streakPlaceholder = { days: 0, label: "Start a streak" }

// ── Profile placeholders (study/activity data not wired yet) ────────────────

export const profilePlaceholder = {
  stats: [
    { icon: "target" as const, value: "—", label: "Readiness score" },
    { icon: "clock" as const, value: "0", label: "Learning hours" },
    { icon: "flame" as const, value: "0", label: "Current streak" },
  ],
  counters: [
    { icon: "bookmark" as const, value: "0", label: "Saves" },
    { icon: "highlighter" as const, value: "0", label: "Highlights" },
    { icon: "share" as const, value: "0", label: "Shares" },
  ],
  historyTitle: "Learning History",
  historySubtitle: "View your recent lessons",
  historyEmptyText: "Your completed lessons and tests will appear here.",
  libraryTabs: ["Completed", "In Progress"],
  library: [
    { icon: "book" as const, value: "0", label: "Study Guides" },
    { icon: "cards" as const, value: "0", label: "Flashcards" },
    { icon: "quiz" as const, value: "0", label: "Quizzes" },
  ],
}
