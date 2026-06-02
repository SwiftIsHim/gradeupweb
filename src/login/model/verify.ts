export interface VerifyContent {
  title: string
  subtitle: string
  otpLabel: string
  submitLabel: string
  resendPrompt: string
  resendLabel: string
  changeMethodLabel: string
  changeMethodHref: string
}

export const verifyContent: VerifyContent = {
  title: "Enter your code",
  subtitle: "We sent a 6-digit code. It expires in 10 minutes.",
  otpLabel: "Verification code",
  submitLabel: "Verify and continue",
  resendPrompt: "Didn't get it?",
  resendLabel: "Resend code",
  changeMethodLabel: "Use a different method",
  changeMethodHref: "/login",
}
