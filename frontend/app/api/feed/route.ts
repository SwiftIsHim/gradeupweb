import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { getFeed } from "@/src/communities/repository/communitiesRepository"

/** GET /api/feed?communityId=&cursor=&limit= — global feed, or a community's feed when scoped. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const communityId = params.get("communityId") ?? undefined
  const cursor = params.get("cursor") ?? undefined
  const limitParam = params.get("limit")
  const limit = limitParam ? Number(limitParam) : undefined

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const feed = await getFeed(accessToken, { communityId, cursor, limit })
    return Response.json(feed)
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "GET /api/feed" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
