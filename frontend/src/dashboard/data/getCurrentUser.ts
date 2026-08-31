import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import {
  fetchCurrentUser,
  type CurrentUser,
} from "@/src/dashboard/repository/userRepository"

/**
 * Resolve the signed-in user's account identity (id/email/username) for
 * dashboard pages. Mirrors `getOnboardingProfile.ts` exactly — same
 * cookie/redirect/`React.cache` shape — but reads from `/users/me` since
 * username/email live on `User`, not `OnboardingProfile`.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    redirect("/login")
  }

  return fetchCurrentUser(accessToken)
})
