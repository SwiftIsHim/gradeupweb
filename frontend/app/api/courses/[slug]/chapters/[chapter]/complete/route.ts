import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { BackendError } from "@/src/login/repository/accountRepository"
import { markChapterComplete } from "@/src/courses/repository/coursesRepository"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string; chapter: string }> },
) {
  const { slug, chapter } = await params
  const chapterNumber = Number(chapter)
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
    return Response.json({ error: "Invalid chapter." }, { status: 400 })
  }

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json(
      { error: "You must be signed in." },
      { status: 401 },
    )
  }

  try {
    const progress = await markChapterComplete(accessToken, slug, chapterNumber)
    return Response.json({ ok: true, progress })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
