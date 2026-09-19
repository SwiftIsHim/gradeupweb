import type { FeedComment, FeedPost, PostPayload, PostType } from "@/src/communities/model/communities"

/** Browser-side feed/post fetchers — same 401-degrades-to-empty convention as `communitiesClient.ts`. */

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

export async function getFeedClient(opts: {
  communityId?: string
  cursor?: string | null
}): Promise<{ items: FeedPost[]; nextCursor: string | null }> {
  const params = new URLSearchParams()
  if (opts.communityId) params.set("communityId", opts.communityId)
  if (opts.cursor) params.set("cursor", opts.cursor)
  const qs = params.toString()

  const res = await fetch(`/api/feed${qs ? `?${qs}` : ""}`, { cache: "no-store" })
  if (res.status === 401) return { items: [], nextCursor: null }
  if (!res.ok) throw new Error("Could not load the feed.")
  const data = (await res.json()) as Partial<{ items: FeedPost[]; nextCursor: string | null }>
  return { items: data.items ?? [], nextCursor: data.nextCursor ?? null }
}

export function createPostClient(input: {
  communityId?: string | null
  type: PostType
  caption?: string
  payload?: PostPayload
}): Promise<{ post: FeedPost }> {
  return postJson("/api/posts", input)
}

export async function deletePostClient(postId: string): Promise<void> {
  const res = await fetch(`/api/posts/${encodeURIComponent(postId)}`, { method: "DELETE" })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? "Request failed. Please try again.")
  }
}

export function reactToPostClient(
  postId: string,
  type: "like" | "clap",
): Promise<{ reacted: boolean; type: "like" | "clap" | null }> {
  return postJson(`/api/posts/${encodeURIComponent(postId)}/react`, { type })
}

export async function listCommentsClient(postId: string): Promise<FeedComment[]> {
  const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, { cache: "no-store" })
  if (res.status === 401) return []
  if (!res.ok) throw new Error("Could not load comments.")
  const data = (await res.json()) as { comments?: FeedComment[] }
  return data.comments ?? []
}

export function addCommentClient(postId: string, body: string): Promise<{ comment: FeedComment }> {
  return postJson(`/api/posts/${encodeURIComponent(postId)}/comments`, { body })
}
