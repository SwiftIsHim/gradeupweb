export interface CtaButton {
  label: string
  href: string
  variant: "primary" | "secondary"
}

export interface CtaContent {
  title: string
  subtitle: string
  buttons: CtaButton[]
}

export const ctaContent: CtaContent = {
  title: "Your next promotion starts tonight.",
  subtitle: "Free to start. Cancel anytime. Built for Civil Service candidates in Nigeria.",
  buttons: [
    { label: "Start free — no card required", href: "/signup", variant: "primary" },
    { label: "Talk to our team", href: "/contact", variant: "secondary" },
  ],
}
