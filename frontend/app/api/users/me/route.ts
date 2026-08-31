import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { fetchCurrentUser } from "@/src/dashboard/repository/userRepository"

/** GET /api/users/me — the signed-in user's account identity. */
export async function GET() {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const user = await fetchCurrentUser(accessToken)
    return Response.json({ user })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "GET /api/users/me" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
