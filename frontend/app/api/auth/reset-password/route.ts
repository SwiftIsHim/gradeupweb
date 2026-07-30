import { reportUnexpectedError } from "@/lib/observability/reportError"
import {
  BackendError,
  requestPasswordReset,
} from "@/src/login/repository/accountRepository"

interface ResetPasswordBody {
  token?: string
  password?: string
}

export async function POST(request: Request) {
  let body: ResetPasswordBody
  try {
    body = (await request.json()) as ResetPasswordBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const token = body.token?.trim()
  const password = body.password
  if (!token) {
    return Response.json({ error: "Reset token is required." }, { status: 400 })
  }
  if (!password) {
    return Response.json({ error: "Password is required." }, { status: 400 })
  }

  try {
    const result = await requestPasswordReset(token, password)
    return Response.json(result)
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "POST /api/auth/reset-password" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
