import "server-only"

/**
 * Diagnostics repository — the attempts data layer.
 *
 * Diagnostic *content* is local-first (JSON → served flat, no client DB —
 * there's only one assessment). What lives on the Express/Mongo backend is the
 * user's *attempts*, under `/diagnostic-attempts` (`Bearer <accessToken>`).
 * Route handlers call these helpers so the browser never talks to the backend
 * directly. Mirrors src/tests/repository/testsRepository.ts.
 */

import { BackendError } from "@/src/login/repository/accountRepository"
import type { AttemptAnswer } from "@/src/tests/model/tests"
import type { DiagnosticAttempt } from "@/src/diagnostics/model/diagnostics"

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

export interface SubmitDiagnosticAttemptInput {
  score: number
  total: number
  durationSeconds?: number | null
  answers?: AttemptAnswer[]
}

/** All of the user's diagnostic attempts (most recent first). */
export async function fetchAllDiagnosticAttempts(
  accessToken: string,
): Promise<DiagnosticAttempt[]> {
  const data = await getJson<{ attempts: DiagnosticAttempt[] }>(
    accessToken,
    `/diagnostic-attempts`,
  )
  return data.attempts
}

/** The user's attempts at one diagnostic. */
export async function fetchDiagnosticAttempts(
  accessToken: string,
  slug: string,
): Promise<DiagnosticAttempt[]> {
  const data = await getJson<{ attempts: DiagnosticAttempt[] }>(
    accessToken,
    `/diagnostic-attempts/${encodeURIComponent(slug)}`,
  )
  return data.attempts
}

/** Record a new diagnostic attempt. */
export async function submitDiagnosticAttempt(
  accessToken: string,
  slug: string,
  input: SubmitDiagnosticAttemptInput,
): Promise<DiagnosticAttempt> {
  const data = await postJson<{ attempt: DiagnosticAttempt }>(
    accessToken,
    `/diagnostic-attempts/${encodeURIComponent(slug)}`,
    input,
  )
  return data.attempt
}
