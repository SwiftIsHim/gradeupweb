import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import {
  fetchPeerRequests,
  sendPeerRequest,
} from "@/src/peers/repository/peersRepository"

/** GET /api/peers/requests — incoming + outgoing pending friend requests. */
export async function GET() {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const requests = await fetchPeerRequests(accessToken)
    return Response.json(requests)
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "GET /api/peers/requests" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}

/** POST /api/peers/requests { recipientId } — send a friend request. */
export async function POST(request: Request) {
  let body: { recipientId?: string }
  try {
    body = (await request.json()) as { recipientId?: string }
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!body.recipientId) {
    return Response.json({ error: "recipientId is required." }, { status: 400 })
  }

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    await sendPeerRequest(accessToken, body.recipientId)
    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "POST /api/peers/requests" })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
