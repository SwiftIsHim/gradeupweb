import type { TestAttempt, AttemptAnswer } from "@/src/tests/model/tests"

/**
 * Browser-side attempt helpers. They call the Next route handlers (which attach
 * the httpOnly access-token cookie and proxy the backend). A 401 degrades to
 * "no attempts" / null rather than throwing.
 */

export async function fetchAllAttemptsClient(): Promise<TestAttempt[]> {
  const res = await fetch("/api/tests/attempts", { cache: "no-store" })
  if (res.status === 401) return []
  if (!res.ok) throw new Error("Could not load your attempts.")
  const data = (await res.json()) as { attempts?: TestAttempt[] }
  return data.attempts ?? []
}

export interface SubmitAttemptPayload {
  score: number
  total: number
  durationSeconds?: number | null
  answers?: AttemptAnswer[]
}

/** Record an attempt; returns the saved attempt, or null if not signed in. */
export async function submitAttemptClient(
  slug: string,
  payload: SubmitAttemptPayload,
): Promise<TestAttempt | null> {
  const res = await fetch(
    `/api/tests/${encodeURIComponent(slug)}/attempts`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  )
  if (res.status === 401) return null
  if (!res.ok) throw new Error("Could not save your attempt.")
  const data = (await res.json()) as { attempt?: TestAttempt }
  return data.attempt ?? null
}
