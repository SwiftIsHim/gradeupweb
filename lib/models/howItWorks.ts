export interface HowItWorksStep {
  id: string
  number: number
  title: string
  description: string
}

export interface HowItWorksContent {
  eyebrow: string
  title: string
  steps: HowItWorksStep[]
}

export const howItWorksContent: HowItWorksContent = {
  eyebrow: "How it works",
  title: "Three minutes to set up. Months of momentum.",
  steps: [
    {
      id: "exam-date",
      number: 1,
      title: "Tell us your exam date",
      description:
        "A 6-question setup gets us your grade level, exam date, and how much time you can give per day.",
    },
    {
      id: "diagnostic",
      number: 2,
      title: "Take the diagnostic",
      description:
        "A short readiness test surfaces your weak spots. We use it to build a personalised study plan, not just a generic syllabus.",
    },
    {
      id: "study-daily",
      number: 3,
      title: "Study daily",
      description:
        "Open the app for 18 minutes a day. Flashcards, chapters, mini-quizzes — all sequenced so you peak on exam week.",
    },
  ],
}
