import type { Community } from "@/src/communities/model/communities"

/**
 * Browser-side community fetchers. They call the Next route handlers (which
 * attach the httpOnly access-token cookie and proxy the backend), so the
 * browser never sees the token. A 401 (signed out) degrades to an empty
 * result rather than throwing, matching `peers/data/peersClient.ts`.
 */

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? "Request failed. Please try again.")
  }
  return res.json() as Promise<T>
}

export async function discoverCommunitiesClient(query: string): Promise<Community[]> {
  const res = await fetch(`/api/communities?q=${encodeURIComponent(query)}`, { cache: "no-store" })
  if (res.status === 401) return []
  if (!res.ok) throw new Error("Could not search communities.")
  const data = (await res.json()) as { communities?: Community[] }
  return data.communities ?? []
}

export async function listMyCommunitiesClient(): Promise<Community[]> {
  const res = await fetch("/api/communities/mine", { cache: "no-store" })
  if (res.status === 401) return []
  if (!res.ok) throw new Error("Could not load your communities.")
  const data = (await res.json()) as { communities?: Community[] }
  return data.communities ?? []
}

export async function listSuggestedCommunitiesClient(): Promise<Community[]> {
  const res = await fetch("/api/communities/suggestions", { cache: "no-store" })
  if (res.status === 401) return []
  if (!res.ok) throw new Error("Could not load suggestions.")
  const data = (await res.json()) as { communities?: Community[] }
  return data.communities ?? []
}

export function createCommunityClient(input: {
  name: string
  description?: string
  examTag?: string | null
  subjects?: string[]
}): Promise<{ community: Community }> {
  return postJson("/api/communities", input)
}

export function joinCommunityClient(communityId: string): Promise<{ community: Community }> {
  return postJson(`/api/communities/${encodeURIComponent(communityId)}/join`)
}

export async function leaveCommunityClient(communityId: string): Promise<void> {
  await postJson(`/api/communities/${encodeURIComponent(communityId)}/leave`)
}
