export type LoginMethod = "phone" | "email"
export type SocialProviderKey = "google" | "apple" | "facebook"

export interface SocialProvider {
  key: SocialProviderKey
  label: string
}

export interface LoginMethodTab {
  method: LoginMethod
  label: string
}

export interface LoginPanelContent {
  eyebrow: string
  headline: string
  subhead: string
  trustedCaption: string
  ratingScore: number
  ratingStars: number
  ratingCaption: string
}

export interface LoginFormContent {
  title: string
  subtitle: string
  methodTabs: LoginMethodTab[]
  phone: {
    label: string
    countryFlag: string
    countryCode: string
    countryIso: string
    placeholder: string
  }
  email: {
    label: string
    placeholder: string
  }
  forgotPasswordLabel: string
  forgotPasswordHref: string
  submitLabel: string
  socialDivider: string
  socialProviders: SocialProvider[]
}

export interface LoginContent {
  panel: LoginPanelContent
  form: LoginFormContent
}

export const loginContent: LoginContent = {
  panel: {
    eyebrow: "Welcome back",
    headline: "Pick up exactly where you left off.",
    subhead:
      "Your study plan, streaks, flashcards, and group chats are waiting on the other side.",
    trustedCaption: "Trusted by 12,000+ Civil Service candidates",
    ratingScore: 4.9,
    ratingStars: 5,
    ratingCaption: "average rating",
  },
  form: {
    title: "Log in",
    subtitle: "Welcome back — let's get you studying.",
    methodTabs: [
      { method: "phone", label: "Phone" },
      { method: "email", label: "Email" },
    ],
    phone: {
      label: "Phone number",
      countryFlag: "🇳🇬",
      countryCode: "+234",
      countryIso: "NG",
      placeholder: "803 145 9821",
    },
    email: {
      label: "Email address",
      placeholder: "you@example.com",
    },
    forgotPasswordLabel: "Forgot password?",
    forgotPasswordHref: "/forgot-password",
    submitLabel: "Continue",
    socialDivider: "or continue with",
    socialProviders: [
      { key: "google", label: "Google" },
      { key: "apple", label: "Apple" },
      { key: "facebook", label: "Facebook" },
    ],
  },
}
