export interface Stat {
  id: string
  value: string
  label: string
  showStar?: boolean
}

export interface StatsContent {
  items: Stat[]
}

export const statsContent: StatsContent = {
  items: [
    { id: "candidates", value: "12,000+", label: "Active candidates" },
    { id: "pass-rate", value: "89%", label: "First-attempt pass rate" },
    { id: "rating", value: "4.9", label: "App store rating", showStar: true },
    { id: "session", value: "18 min", label: "Avg daily session" },
  ],
}
