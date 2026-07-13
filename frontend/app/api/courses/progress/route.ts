import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { fetchAllProgress } from "@/src/courses/repository/coursesRepository"

/** GET /api/courses/progress — all of the signed-in user's course progress. */
export async function GET() {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const progress = await fetchAllProgress(accessToken)
    return Response.json({ progress })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "GET /api/courses/progress" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
