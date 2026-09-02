import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { listSuggestedCommunities } from "@/src/communities/repository/communitiesRepository"

/** GET /api/communities/suggestions — recommended communities for the user. */
export async function GET() {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const communities = await listSuggestedCommunities(accessToken)
    return Response.json({ communities })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "GET /api/communities/suggestions" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
