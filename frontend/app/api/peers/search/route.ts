import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { searchPeers } from "@/src/peers/repository/peersRepository"

/** GET /api/peers/search?q=... — find other users by username or name. */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? ""

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  if (!query.trim()) {
    return Response.json({ results: [] })
  }

  try {
    const results = await searchPeers(accessToken, query)
    return Response.json({ results })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "GET /api/peers/search" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
