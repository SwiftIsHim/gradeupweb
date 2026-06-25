import type { Metadata } from "next"

import { Profile } from "@/src/dashboard/view/profile"
import { toDashboardHeader } from "@/src/dashboard/model/dashboard"
import { getOnboardingProfile } from "@/src/dashboard/data/getOnboardingProfile"

export const metadata: Metadata = {
  title: "Profile — Grade Up",
  description: "Your learning profile and progress.",
}

export default async function ProfilePage() {
  const profile = await getOnboardingProfile()
  return <Profile header={toDashboardHeader(profile)} />
}
