export interface LoginPanelContent {
  eyebrow: string
  headline: string
  subhead: string
  trustedCaption: string
  ratingScore: number
  ratingStars: number
  ratingCaption: string
}

export interface FieldContent {
  label: string
  placeholder: string
}

export interface PhoneFieldContent extends FieldContent {
  countryFlag: string
  countryCode: string
  countryIso: string
}

export interface LoginFormContent {
  // Step headings (the panel stays the same; only the form heading changes).
  emailStep: { title: string; subtitle: string }
  passwordStep: { title: string; subtitle: string }
  signupStep: { title: string; subtitle: string }

  email: FieldContent
  password: FieldContent
  confirmPassword: FieldContent
  name: FieldContent
  phone: PhoneFieldContent

  forgotPasswordLabel: string
  forgotPasswordHref: string

  // Submit button label per step.
  continueLabel: string
  loginLabel: string
  signupLabel: string

  changeEmailLabel: string
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
    emailStep: {
      title: "Log in or sign up",
      subtitle: "Enter your email to continue.",
    },
    passwordStep: {
      title: "Welcome back",
      subtitle: "Enter your password to log in.",
    },
    signupStep: {
      title: "Create your account",
      subtitle: "Let's get you set up — it only takes a minute.",
    },
    email: {
      label: "Email address",
      placeholder: "you@example.com",
    },
    password: {
      label: "Password",
      placeholder: "Enter your password",
    },
    confirmPassword: {
      label: "Confirm password",
      placeholder: "Re-enter your password",
    },
    name: {
      label: "Full name",
      placeholder: "Jane Doe",
    },
    phone: {
      label: "Phone number",
      countryFlag: "🇳🇬",
      countryCode: "+234",
      countryIso: "NG",
      placeholder: "803 145 9821",
    },
    forgotPasswordLabel: "Forgot password?",
    forgotPasswordHref: "/forgot-password",
    continueLabel: "Continue",
    loginLabel: "Log in",
    signupLabel: "Create account",
    changeEmailLabel: "Use a different email",
  },
}
