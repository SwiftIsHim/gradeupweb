import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { BackendError } from "@/src/login/repository/accountRepository"
import { fetchAllAttempts } from "@/src/tests/repository/testsRepository"

/** GET /api/tests/attempts — all of the signed-in user's test attempts. */
export async function GET() {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const attempts = await fetchAllAttempts(accessToken)
    return Response.json({ attempts })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
