import { reportUnexpectedError } from "@/lib/observability/reportError"
import {
  BackendError,
  requestAccountExists,
} from "@/src/login/repository/accountRepository"

interface AccountExistsBody {
  email?: string
}

export async function POST(request: Request) {
  let body: AccountExistsBody
  try {
    body = (await request.json()) as AccountExistsBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const email = body.email?.trim()
  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 })
  }

  try {
    const result = await requestAccountExists(email)
    return Response.json(result)
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "POST /api/auth/account-exists" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
