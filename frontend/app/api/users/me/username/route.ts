import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { updateUsername } from "@/src/dashboard/repository/userRepository"

/** PATCH /api/users/me/username { username } */
export async function PATCH(request: Request) {
  let body: { username?: string }
  try {
    body = (await request.json()) as { username?: string }
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!body.username) {
    return Response.json({ error: "username is required." }, { status: 400 })
  }

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const user = await updateUsername(accessToken, body.username)
    return Response.json({ user })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "PATCH /api/users/me/username" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
