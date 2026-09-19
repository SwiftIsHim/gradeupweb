/**
 * Peers — search for other users, send/accept/decline friend requests, and
 * see an accepted peer's study streak + mutual-friend count. Search results
 * and pending requests intentionally carry identity only (no streak/mutual
 * count) — that's only shown once a request is accepted, per the "don't
 * over-expose personal data to strangers" requirement.
 */

export type RelationshipStatus =
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "friends"

export interface PeerSummary {
  id: string
  username: string
  name: string | null
}

export interface PeerSearchResult extends PeerSummary {
  relationshipStatus: RelationshipStatus
}

export interface Peer extends PeerSummary {
  streakDays: number
  mutualCount: number
  friendsSince: string | null
}

export interface FriendRequest {
  id: string
  createdAt: string
  peer: PeerSummary | null
}

export interface PeerRequests {
  incoming: FriendRequest[]
  outgoing: FriendRequest[]
}

export type PeersTab = "discover" | "peers" | "requests" | "communities" | "feed"

/** First letters of up to two words in the display name; falls back to the username's first letter. */
export function initialsFor(name: string | null, username: string): string {
  const trimmed = name?.trim()
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean)
    const initials = parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("")
    if (initials) return initials
  }
  return username[0]?.toUpperCase() ?? "?"
}
