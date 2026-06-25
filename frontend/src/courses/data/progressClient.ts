import type { RawProgress } from "@/src/courses/model/courses"

/**
 * Browser-side progress fetchers. They call the Next route handlers (which
 * attach the httpOnly access-token cookie and proxy the backend), so the
 * browser never sees the token. A 401 (signed out) degrades to "no progress"
 * rather than throwing, so content still renders.
 */

export async function fetchAllProgressClient(): Promise<RawProgress[]> {
  const res = await fetch("/api/courses/progress", { cache: "no-store" })
  if (res.status === 401) return []
  if (!res.ok) throw new Error("Could not load your progress.")
  const data = (await res.json()) as { progress?: RawProgress[] }
  return data.progress ?? []
}

export async function fetchCourseProgressClient(
  slug: string,
): Promise<RawProgress | null> {
  const res = await fetch(
    `/api/courses/${encodeURIComponent(slug)}/progress`,
    { cache: "no-store" },
  )
  if (res.status === 401) return null
  if (!res.ok) throw new Error("Could not load your progress.")
  const data = (await res.json()) as { progress?: RawProgress }
  return data.progress ?? null
}
