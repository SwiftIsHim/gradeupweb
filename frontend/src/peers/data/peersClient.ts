import type {
  Peer,
  PeerRequests,
  PeerSearchResult,
} from "@/src/peers/model/peers"

/**
 * Browser-side peers fetchers. They call the Next route handlers (which
 * attach the httpOnly access-token cookie and proxy the backend), so the
 * browser never sees the token. A 401 (signed out) degrades to an empty
 * result rather than throwing, matching `courses/data/progressClient.ts`.
 */

async function postJson(path: string, body?: unknown): Promise<void> {
  const res = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? "Request failed. Please try again.")
  }
}

export async function searchPeersClient(query: string): Promise<PeerSearchResult[]> {
  const res = await fetch(`/api/peers/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  })
  if (res.status === 401) return []
  if (!res.ok) throw new Error("Could not search for peers.")
  const data = (await res.json()) as { results?: PeerSearchResult[] }
  return data.results ?? []
}

export async function fetchPeersClient(): Promise<Peer[]> {
  const res = await fetch("/api/peers", { cache: "no-store" })
  if (res.status === 401) return []
  if (!res.ok) throw new Error("Could not load your peers.")
  const data = (await res.json()) as { peers?: Peer[] }
  return data.peers ?? []
}

export async function fetchPeerRequestsClient(): Promise<PeerRequests> {
  const empty: PeerRequests = { incoming: [], outgoing: [] }
  const res = await fetch("/api/peers/requests", { cache: "no-store" })
  if (res.status === 401) return empty
  if (!res.ok) throw new Error("Could not load your friend requests.")
  const data = (await res.json()) as Partial<PeerRequests>
  return { incoming: data.incoming ?? [], outgoing: data.outgoing ?? [] }
}

export function sendPeerRequestClient(recipientId: string): Promise<void> {
  return postJson("/api/peers/requests", { recipientId })
}

export function acceptPeerRequestClient(requestId: string): Promise<void> {
  return postJson(`/api/peers/requests/${encodeURIComponent(requestId)}/accept`)
}

export function declinePeerRequestClient(requestId: string): Promise<void> {
  return postJson(`/api/peers/requests/${encodeURIComponent(requestId)}/decline`)
}

export async function cancelPeerRequestClient(requestId: string): Promise<void> {
  const res = await fetch(`/api/peers/requests/${encodeURIComponent(requestId)}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? "Request failed. Please try again.")
  }
}
