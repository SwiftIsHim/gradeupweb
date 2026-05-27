export type FeatureIconKey = "target" | "cards" | "exam" | "friends"

export interface Feature {
  id: string
  iconKey: FeatureIconKey
  title: string
  description: string
}

export interface FeaturesContent {
  eyebrow: string
  title: string
  subtitle: string
  items: Feature[]
}

export const featuresContent: FeaturesContent = {
  eyebrow: "Features",
  title: "Built for the way you actually study",
  subtitle:
    "Short focused sessions, real exam conditions, and a community that keeps you accountable.",
  items: [
    {
      id: "study-plan",
      iconKey: "target",
      title: "Personalised study plan",
      description:
        "Tell us your exam date and grade level — Grade Up does the math and gives you 18-minute sessions you can actually finish on a busy day.",
    },
    {
      id: "flashcards",
      iconKey: "cards",
      title: "Spaced-repetition flashcards",
      description:
        "Cards you struggle with come back more often. Cards you nail get pushed further out. You spend time only on what matters.",
    },
    {
      id: "mock-exams",
      iconKey: "exam",
      title: "Real-condition mock exams",
      description:
        "Full-length, timed sets that mirror the actual Civil Service exam — including the no-skip, no-pause format. No surprises on the day.",
    },
    {
      id: "study-friends",
      iconKey: "friends",
      title: "Study with friends",
      description:
        "Join groups, see your friends' streaks, race to the top of the leaderboard, and assign group practice tests. Studying alone is hard. Don't.",
    },
  ],
}
