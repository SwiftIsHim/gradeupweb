import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import {
  fetchOnboarding,
  type OnboardingProfile,
} from "@/src/onboarding/repository/onboardingRepository"

/**
 * Resolve the signed-in user's onboarding profile for dashboard pages.
 * Redirects to /login when there's no session and /onboarding when the user
 * hasn't completed setup. Wrapped in React.cache so multiple dashboard pages
 * (or a page + its layout) in one request share a single backend fetch.
 */
export const getOnboardingProfile = cache(
  async (): Promise<OnboardingProfile> => {
    const jar = await cookies()
    const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
    if (!accessToken) {
      redirect("/login")
    }

    const profile = await fetchOnboarding(accessToken)
    if (!profile) {
      redirect("/onboarding")
    }

    return profile
  },
)
