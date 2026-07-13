import * as Sentry from "@sentry/nextjs"

import { clearSessionCookies } from "@/lib/auth/cookies"

export async function POST() {
  await clearSessionCookies()
  Sentry.setUser(null)
  return Response.json({ ok: true })
}
