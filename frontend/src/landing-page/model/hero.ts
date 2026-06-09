export interface HeroCta {
  label: string
  href: string
  variant: "primary" | "secondary"
  icon?: "play"
}

export interface HeroRating {
  score: number
  caption: string
}

export interface DashboardStat {
  label: string
  value: string
  accent?: boolean
}

export interface ContinueLesson {
  subject: string
  chapter: number
  progress: number
}

export interface MiniLessonCard {
  title: string
  cardCount: number
  minutes: number
}

export interface ActivityToast {
  name: string
  detail: string
  context: string
}

export interface HeroDashboard {
  greeting: string
  streakDays: number
  stats: DashboardStat[]
  continueLesson: ContinueLesson
  miniCards: MiniLessonCard[]
  toast: ActivityToast
}

export interface HeroContent {
  eyebrow: string
  headline: string
  subheadline: string
  ctas: HeroCta[]
  rating: HeroRating
  dashboard: HeroDashboard
}

export const heroContent: HeroContent = {
  eyebrow: "Built for the Nigerian Civil Service exam",
  headline: "Pass your promotion exam with a study plan that actually fits your week.",
  subheadline:
    "Grade Up turns the Civil Service syllabus into 18-minute daily sessions — flashcards, mock exams, peer groups — so you walk into exam day calm, not crammed.",
  ctas: [
    { label: "Start free — no card required", href: "/signup", variant: "primary" },
    { label: "Watch 90s tour", href: "#tour", variant: "secondary", icon: "play" },
  ],
  rating: {
    score: 4.9,
    caption: "12,000+ candidates studying this week",
  },
  dashboard: {
    greeting: "Welcome back, Samuel",
    streakDays: 12,
    stats: [
      { label: "Streak", value: "12" },
      { label: "XP", value: "3,120", accent: true },
      { label: "To exam", value: "18d" },
    ],
    continueLesson: {
      subject: "Constitution Basics",
      chapter: 4,
      progress: 64,
    },
    miniCards: [
      { title: "Public Service Rules", cardCount: 11, minutes: 3 },
      { title: "Civil Service Comm.", cardCount: 8, minutes: 2 },
      { title: "Federal Character", cardCount: 12, minutes: 4 },
    ],
    toast: {
      name: "Aisha B.",
      detail: "just hit 88%",
      context: "Constitution Basics · Practice Test",
    },
  },
}
