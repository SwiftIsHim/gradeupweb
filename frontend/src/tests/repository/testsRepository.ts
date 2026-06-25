import "server-only"

/**
 * Tests repository — the attempts data layer.
 *
 * Test *content* is local-first (JSON → WatermelonDB on the client). What lives
 * on the Express/Mongo backend is the user's *attempts*, under `/test-attempts`
 * (`Bearer <accessToken>`). Route handlers call these helpers so the browser
 * never talks to the backend directly.
 */

import { BackendError } from "@/src/login/repository/accountRepository"
import type { TestAttempt, AttemptAnswer } from "@/src/tests/model/tests"

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:4000"

async function getJson<T>(accessToken: string, path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
  } catch {
    throw new BackendError("Could not reach the server. Please try again.", 502)
  }

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: { message?: string } })
    | null

  if (!res.ok) {
    const message = data?.error?.message ?? "Request failed. Please try again."
    throw new BackendError(message, res.status)
  }
  return data as T
}

async function postJson<T>(
  accessToken: string,
  path: string,
  body: unknown,
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })
  } catch {
    throw new BackendError("Could not reach the server. Please try again.", 502)
  }

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: { message?: string } })
    | null

  if (!res.ok) {
    const message = data?.error?.message ?? "Request failed. Please try again."
    throw new BackendError(message, res.status)
  }
  return data as T
}

export interface SubmitAttemptInput {
  score: number
  total: number
  durationSeconds?: number | null
  answers?: AttemptAnswer[]
}

/** All of the user's test attempts (most recent first). */
export async function fetchAllAttempts(
  accessToken: string,
): Promise<TestAttempt[]> {
  const data = await getJson<{ attempts: TestAttempt[] }>(
    accessToken,
    `/test-attempts`,
  )
  return data.attempts
}

/** The user's attempts at one test. */
export async function fetchTestAttempts(
  accessToken: string,
  slug: string,
): Promise<TestAttempt[]> {
  const data = await getJson<{ attempts: TestAttempt[] }>(
    accessToken,
    `/test-attempts/${encodeURIComponent(slug)}`,
  )
  return data.attempts
}

/** Record a new attempt. */
export async function submitAttempt(
  accessToken: string,
  slug: string,
  input: SubmitAttemptInput,
): Promise<TestAttempt> {
  const data = await postJson<{ attempt: TestAttempt }>(
    accessToken,
    `/test-attempts/${encodeURIComponent(slug)}`,
    input,
  )
  return data.attempt
}
