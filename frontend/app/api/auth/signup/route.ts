import * as Sentry from "@sentry/nextjs"

import { setSessionCookies } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import {
  BackendError,
  requestSignup,
} from "@/src/login/repository/accountRepository"

interface SignupBody {
  email?: string
  phone?: string
  name?: string
  organization?: string
  password?: string
}

export async function POST(request: Request) {
  let body: SignupBody
  try {
    body = (await request.json()) as SignupBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const email = body.email?.trim()
  const phone = body.phone?.trim()
  const password = body.password
  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 })
  }
  if (!phone) {
    return Response.json({ error: "Phone number is required." }, { status: 400 })
  }
  if (!password) {
    return Response.json({ error: "Password is required." }, { status: 400 })
  }

  try {
    const session = await requestSignup({
      email,
      phone,
      password,
      name: body.name?.trim() || undefined,
      organization: body.organization?.trim() || undefined,
    })
    await setSessionCookies(session.access_token, session.refresh_token)
    Sentry.setUser({ id: session.user.id, email: session.user.email })
    return Response.json({ ok: true, user: session.user })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "POST /api/auth/signup" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
