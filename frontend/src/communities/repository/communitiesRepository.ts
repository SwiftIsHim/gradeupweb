import "server-only"

/**
 * Communities + Feed repository — talks to the Express + MongoDB backend's
 * `/communities`, `/feed`, and `/posts` endpoints (`Bearer <accessToken>`).
 * Route handlers call these so the browser never talks to the backend
 * directly, same pattern as `peers/repository/peersRepository.ts`.
 */

import { BackendError } from "@/src/login/repository/accountRepository"
import type { Community, FeedComment, FeedPost, PostPayload, PostType } from "@/src/communities/model/communities"

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:4000"

async function request<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
        ...init?.headers,
      },
      cache: "no-store",
    })
  } catch {
    throw new BackendError("Could not reach the server. Please try again.", 502)
  }

  const data = (await res.json().catch(() => null)) as (T & { error?: { message?: string } }) | null

  if (!res.ok) {
    const message = data?.error?.message ?? "Request failed. Please try again."
    throw new BackendError(message, res.status)
  }

  return data as T
}

// ── Communities ───────────────────────────────────────────────────────────

export async function discoverCommunities(accessToken: string, q: string): Promise<Community[]> {
  const data = await request<{ communities: Community[] }>(
    accessToken,
    `/communities?q=${encodeURIComponent(q)}`,
  )
  return data.communities
}

export async function listMyCommunities(accessToken: string): Promise<Community[]> {
  const data = await request<{ communities: Community[] }>(accessToken, `/communities/mine`)
  return data.communities
}

export async function listSuggestedCommunities(accessToken: string): Promise<Community[]> {
  const data = await request<{ communities: Community[] }>(accessToken, `/communities/suggestions`)
  return data.communities
}

export async function createCommunity(
  accessToken: string,
  input: { name: string; description?: string; examTag?: string | null; subjects?: string[] },
): Promise<Community> {
  const data = await request<{ community: Community }>(accessToken, `/communities`, {
    method: "POST",
    body: JSON.stringify(input),
  })
  return data.community
}

export async function joinCommunity(accessToken: string, communityId: string): Promise<Community> {
  const data = await request<{ community: Community }>(
    accessToken,
    `/communities/${encodeURIComponent(communityId)}/join`,
    { method: "POST" },
  )
  return data.community
}

export async function leaveCommunity(accessToken: string, communityId: string): Promise<void> {
  await request(accessToken, `/communities/${encodeURIComponent(communityId)}/leave`, { method: "POST" })
}

export async function removeMember(accessToken: string, communityId: string, userId: string): Promise<void> {
  await request(
    accessToken,
    `/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  )
}

// ── Feed ──────────────────────────────────────────────────────────────────

export async function getFeed(
  accessToken: string,
  opts: { communityId?: string; cursor?: string | null; limit?: number },
): Promise<{ items: FeedPost[]; nextCursor: string | null }> {
  const params = new URLSearchParams()
  if (opts.communityId) params.set("communityId", opts.communityId)
  if (opts.cursor) params.set("cursor", opts.cursor)
  if (opts.limit) params.set("limit", String(opts.limit))
  const qs = params.toString()
  return request<{ items: FeedPost[]; nextCursor: string | null }>(accessToken, `/feed${qs ? `?${qs}` : ""}`)
}

// ── Posts ─────────────────────────────────────────────────────────────────

export async function createPost(
  accessToken: string,
  input: { communityId?: string | null; type: PostType; caption?: string; payload?: PostPayload },
): Promise<FeedPost> {
  const data = await request<{ post: FeedPost }>(accessToken, `/posts`, {
    method: "POST",
    body: JSON.stringify(input),
  })
  return data.post
}

export async function deletePost(accessToken: string, postId: string): Promise<void> {
  await request(accessToken, `/posts/${encodeURIComponent(postId)}`, { method: "DELETE" })
}

export async function reactToPost(
  accessToken: string,
  postId: string,
  type: "like" | "clap",
): Promise<{ reacted: boolean; type: "like" | "clap" | null }> {
  return request(accessToken, `/posts/${encodeURIComponent(postId)}/react`, {
    method: "POST",
    body: JSON.stringify({ type }),
  })
}

export async function listComments(accessToken: string, postId: string): Promise<FeedComment[]> {
  const data = await request<{ comments: FeedComment[] }>(
    accessToken,
    `/posts/${encodeURIComponent(postId)}/comments`,
  )
  return data.comments
}

export async function addComment(accessToken: string, postId: string, body: string): Promise<FeedComment> {
  const data = await request<{ comment: FeedComment }>(
    accessToken,
    `/posts/${encodeURIComponent(postId)}/comments`,
    { method: "POST", body: JSON.stringify({ body }) },
  )
  return data.comment
}
