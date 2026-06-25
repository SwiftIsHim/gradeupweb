import "server-only"

/**
 * Courses repository — the progress data layer for the study flow.
 *
 * Course *content* no longer comes through here: it is read from the local
 * JSON files and stored in WatermelonDB on the client (see ../db, ../data).
 * What remains is per-user *progress*, which still lives in the Express +
 * MongoDB backend under `/progress` (`Bearer <accessToken>`). Route handlers
 * call these helpers so the browser never talks to the backend directly.
 */

import { BackendError } from "@/src/login/repository/accountRepository"
import type { RawProgress } from "@/src/courses/model/courses"

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:4000"

/** Shared GET helper: attaches the bearer token and returns the parsed body. */
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

/** Shared POST helper. */
async function postJson<T>(
  accessToken: string,
  path: string,
  body?: unknown,
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
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

/** All of the user's per-course progress. */
export async function fetchAllProgress(
  accessToken: string,
): Promise<RawProgress[]> {
  const data = await getJson<{ progress: RawProgress[] }>(
    accessToken,
    `/progress`,
  )
  return data.progress
}

/** One course's progress for the user. */
export async function fetchCourseProgress(
  accessToken: string,
  slug: string,
): Promise<RawProgress> {
  const data = await getJson<{ progress: RawProgress }>(
    accessToken,
    `/progress/${encodeURIComponent(slug)}`,
  )
  return data.progress
}

/** Mark a chapter complete. */
export async function markChapterComplete(
  accessToken: string,
  slug: string,
  chapterNumber: number,
): Promise<RawProgress> {
  const data = await postJson<{ progress: RawProgress }>(
    accessToken,
    `/progress/${encodeURIComponent(slug)}/chapters/${chapterNumber}/complete`,
  )
  return data.progress
}

/** Save a quiz result for a chapter. */
export async function submitQuizResult(
  accessToken: string,
  slug: string,
  chapterNumber: number,
  score: number,
  total: number,
): Promise<RawProgress> {
  const data = await postJson<{ progress: RawProgress }>(
    accessToken,
    `/progress/${encodeURIComponent(slug)}/chapters/${chapterNumber}/quiz`,
    { score, total },
  )
  return data.progress
}
