/**
 * Onboarding content + types.
 *
 * Eight steps. Answers are persisted to the backend on finish (see the view
 * model's `finish` → POST /api/onboarding). The step order here drives the
 * progress bar and the "Step X of 8" counter.
 */

export type StepId =
  | "welcome"
  | "goal"
  | "name"
  | "grade"
  | "subjects"
  | "examDate"
  | "dailyGoal"
  | "notifications"

export const STEP_ORDER: StepId[] = [
  "welcome",
  "goal",
  "name",
  "grade",
  "subjects",
  "examDate",
  "dailyGoal",
  "notifications",
]

export const TOTAL_STEPS = STEP_ORDER.length

export interface Choice {
  value: string
  title: string
  description?: string
}

export type ExamDateMode = "4w" | "8w" | "custom"

export interface OnboardingData {
  firstName: string
  lastName: string
  goal: string
  gradeLevel: string
  subjects: string[]
  examDateMode: ExamDateMode | ""
  examDay: string
  examMonth: string // "0".."11"
  examYear: string
  dailyMinutes: string // "15" | "30" | "45" | "60"
  schedule: string
  notifications: "on" | "off" | ""
}

export const initialData: OnboardingData = {
  firstName: "",
  lastName: "",
  goal: "",
  gradeLevel: "",
  subjects: [],
  examDateMode: "",
  examDay: "",
  examMonth: "",
  examYear: "",
  dailyMinutes: "",
  schedule: "",
  notifications: "",
}

export const brandName = "Grade Up"
export const brandInitial = "G"

// ── Step 1 — Welcome ────────────────────────────────────────────────────────
export const welcomeContent = {
  title: "Welcome to Grade Up",
  subtitle:
    "Let's build a study plan that fits your schedule. This takes about two minutes.",
  highlights: [
    "Tailored to your grade level and exam date",
    "Bite-sized daily sessions with flashcards & mocks",
    "Reminders so you never lose your streak",
  ],
  cta: "Let's go",
}

// ── Step 2 — Goal ───────────────────────────────────────────────────────────
export const goalContent = {
  title: "What are you preparing for?",
  subtitle: "We'll shape your plan around the right exam.",
  options: [
    {
      value: "promotion",
      title: "Promotion examination",
      description: "Move up to the next grade level",
    },
    {
      value: "confirmation",
      title: "Confirmation examination",
      description: "Confirm your current appointment",
    },
    {
      value: "conversion",
      title: "Conversion examination",
      description: "Convert or upgrade your cadre",
    },
    {
      value: "general",
      title: "General study",
      description: "Sharpen up — no specific exam yet",
    },
  ] satisfies Choice[],
}

// ── Step 3 — Name ───────────────────────────────────────────────────────────
export const nameContent = {
  title: "What should we call you?",
  subtitle: "This will appear on your profile and certificates.",
  firstNameLabel: "First name",
  firstNamePlaceholder: "Samuel",
  lastNameLabel: "Last name",
  lastNamePlaceholder: "Adekunle",
  helper: "Used for certificates and group display.",
}

// ── Step 4 — Grade level ────────────────────────────────────────────────────
export const gradeContent = {
  title: "What's your current grade level?",
  subtitle: "We'll tailor your study plan and exam recommendations to your level.",
  options: [
    {
      value: "6",
      title: "Grade Level 6",
      description: "Senior Officer · entry into management",
    },
    {
      value: "7",
      title: "Grade Level 7",
      description: "Higher Officer · supervisory roles",
    },
    {
      value: "8",
      title: "Grade Level 8",
      description: "Principal Officer · senior management",
    },
    {
      value: "9",
      title: "Grade Level 9",
      description: "Assistant Director · directorate-level",
    },
    {
      value: "10",
      title: "Grade Level 10+",
      description: "Director and above · executive cadre",
    },
  ] satisfies Choice[],
}

// ── Step 5 — Subjects ───────────────────────────────────────────────────────
export const subjectsContent = {
  title: "Which subjects do you want to focus on?",
  subtitle: "Pick at least one — you can change these later.",
  options: [
    { value: "constitution", title: "Constitution Basics" },
    { value: "public-service-rules", title: "Public Service Rules" },
    { value: "financial-regs", title: "Financial Regulations" },
    { value: "public-admin", title: "Public Administration" },
    { value: "current-affairs", title: "Current Affairs" },
    { value: "office-comms", title: "Office Communication" },
  ] satisfies Choice[],
}

// ── Step 6 — Exam date ──────────────────────────────────────────────────────
export const examDateContent = {
  title: "When is your exam?",
  subtitle: "We'll work backwards from this date to build your study plan.",
  quickLabel: "Quick options",
  pickLabel: "Or pick a specific date",
  quickOptions: [
    { value: "4w" as const, title: "In 4 weeks" },
    { value: "8w" as const, title: "In 8 weeks" },
    { value: "custom" as const, title: "I have a date", subtitle: "Pick below" },
  ],
  dayLabel: "Day",
  monthLabel: "Month",
  yearLabel: "Year",
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

// ── Step 7 — Daily goal ─────────────────────────────────────────────────────
export const dailyGoalContent = {
  title: "What's your daily study goal?",
  subtitle: "Consistency beats cramming. Pick what's realistic for you.",
  minutesLabel: "Minutes per day",
  minutesOptions: [
    { value: "15", title: "15 min", description: "Light" },
    { value: "30", title: "30 min", description: "Steady" },
    { value: "45", title: "45 min", description: "Focused" },
    { value: "60", title: "60 min", description: "Intense" },
  ] satisfies Choice[],
  scheduleLabel: "When do you study best?",
  scheduleOptions: [
    { value: "weekday-mornings", title: "Weekday mornings" },
    { value: "weekday-evenings", title: "Weekday evenings" },
    { value: "weekends", title: "Weekends" },
    { value: "flexible", title: "Flexible" },
  ] satisfies Choice[],
}

// schedule value → human label + a suggested start time for the completion copy
export const SCHEDULE_LABELS: Record<string, { label: string; time: string }> = {
  "weekday-mornings": { label: "weekday mornings", time: "7:00 AM" },
  "weekday-evenings": { label: "weekday evenings", time: "5:00 PM" },
  weekends: { label: "weekends", time: "10:00 AM" },
  flexible: { label: "flexible hours", time: "anytime" },
}

// ── Step 8 — Notifications ──────────────────────────────────────────────────
export const notificationsContent = {
  title: "Stay on track with reminders",
  subtitle: "A gentle nudge at study time keeps your streak alive.",
  options: [
    {
      value: "on",
      title: "Enable reminders",
      description: "Recommended — we'll remind you at your study time",
    },
    {
      value: "off",
      title: "Maybe later",
      description: "You can turn these on anytime in settings",
    },
  ] satisfies Choice[],
}

// ── Completion ──────────────────────────────────────────────────────────────
export const completionContent = {
  adjustLabel: "Adjust setup",
  getStartedLabel: "Get started",
  summaryLabels: {
    name: "Name",
    grade: "Grade level",
    examDate: "Exam date",
    dailyGoal: "Daily goal",
    notifications: "Notifications",
  },
}
