import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { addComment, listComments } from "@/src/communities/repository/communitiesRepository"

/** GET /api/posts/[id]/comments */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const comments = await listComments(accessToken, id)
    return Response.json({ comments })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "GET /api/posts/[id]/comments", id })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}

/** POST /api/posts/[id]/comments { body } */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let payload: { body?: string }
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }
  if (!payload.body) {
    return Response.json({ error: "body is required." }, { status: 400 })
  }

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const comment = await addComment(accessToken, id, payload.body)
    return Response.json({ comment }, { status: 201 })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "POST /api/posts/[id]/comments", id })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
