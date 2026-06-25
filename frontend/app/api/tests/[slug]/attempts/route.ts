import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies"
import { BackendError } from "@/src/login/repository/accountRepository"
import {
  fetchTestAttempts,
  submitAttempt,
  type SubmitAttemptInput,
} from "@/src/tests/repository/testsRepository"

async function requireToken(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}

/** GET /api/tests/[slug]/attempts — the user's attempts at one test. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const accessToken = await requireToken()
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const attempts = await fetchTestAttempts(accessToken, slug)
    return Response.json({ attempts })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}

/** POST /api/tests/[slug]/attempts — record a new attempt. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  let body: SubmitAttemptInput
  try {
    body = (await request.json()) as SubmitAttemptInput
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

  const accessToken = await requireToken()
  if (!accessToken) {
    return Response.json({ error: "You must be signed in." }, { status: 401 })
  }

  try {
    const attempt = await submitAttempt(accessToken, slug, {
      score,
      total,
      durationSeconds: body.durationSeconds ?? null,
      answers: body.answers,
    })
    return Response.json({ ok: true, attempt }, { status: 201 })
  } catch (error) {
    if (error instanceof BackendError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    return Response.json({ error: "Unexpected error." }, { status: 500 })
  }
}
