import type { Metadata } from "next"

import { OnboardingFlow } from "@/src/onboarding/view/onboarding-flow"

export const metadata: Metadata = {
  title: "Set up your study plan — Grade Up",
  description: "Tell us about your exam and we'll build a study plan that fits.",
}

export default function OnboardingPage() {
  return <OnboardingFlow />
}
