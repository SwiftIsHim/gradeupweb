import type { PeerSummary } from "@/src/peers/model/peers"

/**
 * Communities + Feed — a separate concept from Peers (friends). Communities
 * are joined by exam/subject/study goal; the feed carries score shares,
 * learning notes, and quiz/exam shares, with reactions and comments.
 * quizShare/examShare map onto the backend's existing test/diagnostic
 * attempt-kind vocabulary rather than inventing new content types.
 */

export interface Community {
  id: string
  name: string
  description: string
  examTag: string | null
  subjects: string[]
  memberCount: number
  isPublic: boolean
  createdBy: string
  createdAt: string
  isMember: boolean
  role: "member" | "admin" | null
}

export type PostType = "score" | "learning" | "quizShare" | "examShare"

export interface ScorePayload {
  kind: "test" | "diagnostic"
  slug: string
  title: string
  score: number
  total: number
}

export interface SharedContentPayload {
  kind: "test" | "diagnostic"
  slug: string
  title: string
  subject: string | null
  questionCount: number
  bestScore: number | null
}

export type PostPayload = ScorePayload | SharedContentPayload | null

export interface FeedPost {
  id: string
  authorId: string
  communityId: string | null
  type: PostType
  caption: string
  payload: PostPayload
  reactionCount: number
  commentCount: number
  createdAt: string
  author: PeerSummary | null
  viewerReaction: "like" | "clap" | null
}

export interface FeedComment {
  id: string
  postId: string
  body: string
  createdAt: string
  author: PeerSummary | null
}

export type FeedScope = { kind: "global" } | { kind: "community"; communityId: string }

export interface ComposerState {
  type: PostType
  caption: string
  payload: PostPayload
}

export const EMPTY_COMPOSER_STATE: ComposerState = { type: "learning", caption: "", payload: null }

/** Human-readable badge label for a post type. */
export function typeLabel(type: PostType): string {
  switch (type) {
    case "score":
      return "Score"
    case "learning":
      return "Learning"
    case "quizShare":
      return "Quiz"
    case "examShare":
      return "Exam"
  }
}

export function isSharedContentPayload(payload: PostPayload): payload is SharedContentPayload {
  return Boolean(payload) && "questionCount" in (payload as object)
}

export function isScorePayload(payload: PostPayload): payload is ScorePayload {
  return Boolean(payload) && "score" in (payload as object) && "total" in (payload as object)
}
