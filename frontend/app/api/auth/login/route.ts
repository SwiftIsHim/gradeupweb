import * as Sentry from "@sentry/nextjs"

import { setSessionCookies } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import {
  BackendError,
  requestPasswordLogin,
} from "@/src/login/repository/accountRepository"

interface LoginBody {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  let body: LoginBody
  try {
    body = (await request.json()) as LoginBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const email = body.email?.trim()
  const password = body.password
  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 })
  }
  if (!password) {
    return Response.json({ error: "Password is required." }, { status: 400 })
  }

  try {
    const session = await requestPasswordLogin(email, password)
    await setSessionCookies(session.access_token, session.refresh_token)
    Sentry.setUser({ id: session.user.id, email: session.user.email })
    return Response.json({ ok: true, user: session.user })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "POST /api/auth/login" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
