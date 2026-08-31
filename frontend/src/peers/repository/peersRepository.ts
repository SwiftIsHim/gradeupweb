import "server-only"

/**
 * Peers repository — talks to the Express + MongoDB backend's `/peers`
 * endpoints (`Bearer <accessToken>`). Route handlers call these so the
 * browser never talks to the backend directly, same pattern as
 * `courses/repository/coursesRepository.ts`.
 */

import { BackendError } from "@/src/login/repository/accountRepository"
import type {
  Peer,
  PeerRequests,
  PeerSearchResult,
} from "@/src/peers/model/peers"

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:4000"

async function request<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
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

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: { message?: string } })
    | null

  if (!res.ok) {
    const message = data?.error?.message ?? "Request failed. Please try again."
    throw new BackendError(message, res.status)
  }

  return data as T
}

export async function searchPeers(
  accessToken: string,
  query: string,
): Promise<PeerSearchResult[]> {
  const data = await request<{ results: PeerSearchResult[] }>(
    accessToken,
    `/peers/search?q=${encodeURIComponent(query)}`,
  )
  return data.results
}

export async function fetchPeers(accessToken: string): Promise<Peer[]> {
  const data = await request<{ peers: Peer[] }>(accessToken, `/peers`)
  return data.peers
}

export async function fetchPeerRequests(
  accessToken: string,
): Promise<PeerRequests> {
  return request<PeerRequests>(accessToken, `/peers/requests`)
}

export async function sendPeerRequest(
  accessToken: string,
  recipientId: string,
): Promise<void> {
  await request(accessToken, `/peers/requests`, {
    method: "POST",
    body: JSON.stringify({ recipientId }),
  })
}

export async function acceptPeerRequest(
  accessToken: string,
  requestId: string,
): Promise<void> {
  await request(accessToken, `/peers/requests/${encodeURIComponent(requestId)}/accept`, {
    method: "POST",
  })
}

export async function declinePeerRequest(
  accessToken: string,
  requestId: string,
): Promise<void> {
  await request(accessToken, `/peers/requests/${encodeURIComponent(requestId)}/decline`, {
    method: "POST",
  })
}

export async function cancelPeerRequest(
  accessToken: string,
  requestId: string,
): Promise<void> {
  await request(accessToken, `/peers/requests/${encodeURIComponent(requestId)}`, {
    method: "DELETE",
  })
}
