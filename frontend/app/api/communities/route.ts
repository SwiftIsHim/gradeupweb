import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { createCommunity, discoverCommunities } from "@/src/communities/repository/communitiesRepository"

/** GET /api/communities?q=... — discover/search communities. */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? ""

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const communities = await discoverCommunities(accessToken, query)
    return Response.json({ communities })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "GET /api/communities" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}

/** POST /api/communities { name, description, examTag, subjects } — create a community. */
export async function POST(request: Request) {
  let body: { name?: string; description?: string; examTag?: string | null; subjects?: string[] }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!body.name) {
    return Response.json({ error: "name is required." }, { status: 400 })
  }

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const community = await createCommunity(accessToken, body as { name: string } & typeof body)
    return Response.json({ community }, { status: 201 })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "POST /api/communities" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
