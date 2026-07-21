export interface ResetPasswordContent {
  heading: { title: string; subtitle: string }
  invalidLink: { title: string; message: string }
  doneStep: { title: string; subtitle: string }
  password: { label: string; placeholder: string }
  confirmPassword: { label: string; placeholder: string }
  submitLabel: string
  backToLoginLabel: string
  backToLoginHref: string
  requestNewLinkLabel: string
  requestNewLinkHref: string
}

export const resetPasswordContent: ResetPasswordContent = {
  heading: {
    title: "Set a new password",
    subtitle: "Choose a new password for your account.",
  },
  invalidLink: {
    title: "This link isn't valid",
    message:
      "This password reset link is invalid or has expired. Request a new one to continue.",
  },
  doneStep: {
    title: "Password updated",
    subtitle: "Your password has been changed. You can now log in.",
  },
  password: {
    label: "New password",
    placeholder: "Enter your new password",
  },
  confirmPassword: {
    label: "Confirm new password",
    placeholder: "Re-enter your new password",
  },
  submitLabel: "Reset password",
  backToLoginLabel: "Back to log in",
  backToLoginHref: "/login",
  requestNewLinkLabel: "Request a new link",
  requestNewLinkHref: "/forgot-password",
}
