import { clearSessionCookies } from "@/lib/auth/cookies"

export async function POST() {
  await clearSessionCookies()
  return Response.json({ ok: true })
}
