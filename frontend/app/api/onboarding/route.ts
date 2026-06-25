import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { BackendError } from "@/src/login/repository/accountRepository"
import {
  saveOnboarding,
  type SaveOnboardingInput,
} from "@/src/onboarding/repository/onboardingRepository"

export async function POST(request: Request) {
  let body: Partial<SaveOnboardingInput>
  try {
    body = (await request.json()) as Partial<SaveOnboardingInput>
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json(
      { error: "You must be signed in to save your setup." },
      { status: 401 },
    )
  }

  try {
    const { profile } = await saveOnboarding(
      accessToken,
      body as SaveOnboardingInput,
    )
    return Response.json({ ok: true, profile })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
