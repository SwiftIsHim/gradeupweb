import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { reportUnexpectedError } from "@/lib/observability/reportError"
import { BackendError } from "@/src/login/repository/accountRepository"
import { cancelPeerRequest } from "@/src/peers/repository/peersRepository"

/** DELETE /api/peers/requests/[id] — cancel a pending outgoing request. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    await cancelPeerRequest(accessToken, id)
    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    reportUnexpectedError(error, { route: "DELETE /api/peers/requests/[id]", id })
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
