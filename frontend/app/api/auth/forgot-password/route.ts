import { reportUnexpectedError } from "@/lib/observability/reportError"
import {
  BackendError,
  requestPasswordResetEmail,
} from "@/src/login/repository/accountRepository"

interface ForgotPasswordBody {
  email?: string
}

export async function POST(request: Request) {
  let body: ForgotPasswordBody
  try {
    body = (await request.json()) as ForgotPasswordBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const email = body.email?.trim()
  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 })
  }

  try {
    const result = await requestPasswordResetEmail(email)
    return Response.json(result)
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "POST /api/auth/forgot-password" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
