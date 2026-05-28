export type TestimonialAvatarColor = "purple" | "sky" | "amber" | "rose" | "green"

export interface Testimonial {
  id: string
  quote: string
  name: string
  initials: string
  role: string
  avatarColor: TestimonialAvatarColor
  passedScore: number
  stars: number
}

export interface TestimonialsContent {
  title: string
  subtitle: string
  items: Testimonial[]
}

export const testimonialsContent: TestimonialsContent = {
  title: "What candidates say",
  subtitle:
    "Real reviews from civil servants who passed their promotion exam after using Grade Up.",
  items: [
    {
      id: "aisha",
      quote:
        "I tried passing my GL8 promotion three times before Grade Up. The mock exams felt exactly like the real thing — by exam day I was bored, in a good way.",
      name: "Aisha Bello",
      initials: "AB",
      role: "Promoted to GL8 · FCSC",
      avatarColor: "purple",
      passedScore: 88,
      stars: 5,
    },
    {
      id: "tunde",
      quote:
        "18 minutes a day, that's it. I did flashcards on the bus and chapters at lunch. The streak counter is dangerously addictive.",
      name: "Tunde Okafor",
      initials: "TO",
      role: "Senior Officer · Min. of Finance",
      avatarColor: "sky",
      passedScore: 91,
      stars: 5,
    },
    {
      id: "folake",
      quote:
        "My study group on Grade Up kept me honest. We did the Saturday mock exams together every week for 8 weeks. All five of us passed.",
      name: "Folake Adesanya",
      initials: "FA",
      role: "Higher Officer · NIMC",
      avatarColor: "amber",
      passedScore: 84,
      stars: 5,
    },
  ],
}
