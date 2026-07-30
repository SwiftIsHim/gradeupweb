export interface ForgotPasswordContent {
  requestStep: { title: string; subtitle: string }
  sentStep: { title: string; subtitle: string }
  email: { label: string; placeholder: string }
  submitLabel: string
  backToLoginLabel: string
  backToLoginHref: string
}

export const forgotPasswordContent: ForgotPasswordContent = {
  requestStep: {
    title: "Forgot your password?",
    subtitle: "Enter your email and we'll send you a link to reset it.",
  },
  sentStep: {
    title: "Check your email",
    subtitle:
      "If an account exists for that email, we've sent a link to reset your password.",
  },
  email: {
    label: "Email address",
    placeholder: "you@example.com",
  },
  submitLabel: "Send reset link",
  backToLoginLabel: "Back to log in",
  backToLoginHref: "/login",
}
