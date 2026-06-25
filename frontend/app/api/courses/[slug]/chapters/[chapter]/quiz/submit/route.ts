import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { BackendError } from "@/src/login/repository/accountRepository"
import { submitQuizResult } from "@/src/courses/repository/coursesRepository"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; chapter: string }> },
) {
  const { slug, chapter } = await params
  const chapterNumber = Number(chapter)
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
    return Response.json({ error: "Invalid chapter." }, { status: 400 })
  }

  let body: { score?: number; total?: number }
  try {
    body = (await request.json()) as { score?: number; total?: number }
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const score = Number(body.score)
  const total = Number(body.total)
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1) {
    return Response.json(
      { error: "A valid score and total are required." },
      { status: 400 },
    )
  }

  const jar = await cookies()
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const progress = await submitQuizResult(
      accessToken,
      slug,
      chapterNumber,
      score,
      total,
    )
    return Response.json({ ok: true, progress })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
