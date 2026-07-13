import type { Metadata } from "next";

import { Dashboard } from "@/src/dashboard/view/dashboard";
import { toDashboardHeader } from "@/src/dashboard/model/dashboard";
import { getOnboardingProfile } from "@/src/dashboard/data/getOnboardingProfile";

export const metadata: Metadata = {
  title: "Dashboard — Grade Up",
  description: "Your study plan at a glance.",
};

export default async function DashboardPage() {
  const profile = await getOnboardingProfile();
  // throw new Error("sentry pipeline test — remove me");
  return <Dashboard header={toDashboardHeader(profile)} />;
}
