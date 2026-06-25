import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { BackendError } from "@/src/login/repository/accountRepository"
import { fetchCourseProgress } from "@/src/courses/repository/coursesRepository"

/** GET /api/courses/[slug]/progress — one course's progress for the user. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const progress = await fetchCourseProgress(accessToken, slug)
    return Response.json({ progress })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
