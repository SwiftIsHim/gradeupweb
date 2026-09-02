import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { createPost } from "@/src/communities/repository/communitiesRepository"
import type { PostPayload, PostType } from "@/src/communities/model/communities"

/** POST /api/posts { communityId, type, caption, payload } — create a feed post. */
export async function POST(request: Request) {
  let body: { communityId?: string | null; type?: PostType; caption?: string; payload?: PostPayload }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!body.type) {
    return Response.json({ error: "type is required." }, { status: 400 })
  }

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const post = await createPost(accessToken, body as { type: PostType } & typeof body)
    return Response.json({ post }, { status: 201 })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "POST /api/posts" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
