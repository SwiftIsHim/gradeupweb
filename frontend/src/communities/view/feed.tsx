"use client"

import { useEffect, useState } from "react"
import { Heart, MessageCircle, PartyPopper, Send, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { initialsFor } from "@/src/peers/model/peers"
import {
  isScorePayload,
  isSharedContentPayload,
  typeLabel,
  type FeedPost,
  type PostType,
} from "@/src/communities/model/communities"
import type { CommunitiesViewModel } from "@/src/communities/viewmodel/useCommunitiesViewModel"
import { fetchAllAttemptsClient } from "@/src/tests/data/attemptsClient"
import { fetchAllDiagnosticAttemptsClient } from "@/src/diagnostics/data/attemptsClient"
import type { TestAttempt } from "@/src/tests/model/tests"
import type { DiagnosticAttempt } from "@/src/diagnostics/model/diagnostics"

/** Attempts don't carry a display title (content lives client-side, keyed by slug) — format the slug instead. */
function titleFromSlug(slug: string): string {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function dedupeBySlugLatest<T>(attempts: T[], slugOf: (a: T) => string, takenAtOf: (a: T) => string): T[] {
  const bySlug = new Map<string, T>()
  for (const a of attempts) {
    const slug = slugOf(a)
    const existing = bySlug.get(slug)
    if (!existing || new Date(takenAtOf(a)) > new Date(takenAtOf(existing))) bySlug.set(slug, a)
  }
  return [...bySlug.values()]
}

function useOwnAttempts() {
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([])
  const [diagnosticAttempts, setDiagnosticAttempts] = useState<DiagnosticAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAllAttemptsClient(), fetchAllDiagnosticAttemptsClient()])
      .then(([tests, diagnostics]) => {
        if (cancelled) return
        setTestAttempts(tests)
        setDiagnosticAttempts(diagnostics)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { testAttempts, diagnosticAttempts, loading }
}

const POST_TYPES: { key: PostType; label: string }[] = [
  { key: "learning", label: "Note" },
  { key: "score", label: "Score" },
  { key: "quizShare", label: "Quiz" },
  { key: "examShare", label: "Exam" },
]

function ScopeSelector({ vm }: { vm: CommunitiesViewModel }) {
  const value = vm.activeScope.kind === "global" ? "global" : vm.activeScope.communityId
  return (
    <select
      value={value}
      onChange={(e) => {
        const v = e.target.value
        vm.setActiveScope(v === "global" ? { kind: "global" } : { kind: "community", communityId: v })
      }}
      className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-foreground outline-none focus:border-green-500"
    >
      <option value="global">Global feed</option>
      {vm.joinedCommunities.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}

function AttemptList<T>({
  label,
  attempts,
  slugOf,
  onSelect,
  selectedSlug,
}: {
  label: string
  attempts: T[]
  slugOf: (a: T) => string
  onSelect: (a: T) => void
  selectedSlug?: string
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {attempts.length === 0 ? (
        <p className="text-xs text-muted-foreground">No attempts yet — take one first.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {attempts.map((a, i) => {
            const slug = slugOf(a)
            const selected = slug === selectedSlug
            return (
              <button
                key={`${slug}-${i}`}
                type="button"
                onClick={() => onSelect(a)}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  selected
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {titleFromSlug(slug)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Composer({ vm }: { vm: CommunitiesViewModel }) {
  const { testAttempts, diagnosticAttempts, loading: attemptsLoading } = useOwnAttempts()
  const { type, caption, payload } = vm.composerState

  const setType = (nextType: PostType) => vm.setComposerField({ type: nextType, payload: null, caption: "" })

  const selectTestAttempt = (attempt: TestAttempt) => {
    vm.setComposerField({
      payload:
        type === "score"
          ? { kind: "test", slug: attempt.testSlug, title: titleFromSlug(attempt.testSlug), score: attempt.score, total: attempt.total }
          : {
              kind: "test",
              slug: attempt.testSlug,
              title: titleFromSlug(attempt.testSlug),
              subject: null,
              questionCount: attempt.total,
              bestScore: attempt.percent,
            },
    })
  }

  const selectDiagnosticAttempt = (attempt: DiagnosticAttempt) => {
    vm.setComposerField({
      payload:
        type === "score"
          ? {
              kind: "diagnostic",
              slug: attempt.diagnosticSlug,
              title: titleFromSlug(attempt.diagnosticSlug),
              score: attempt.score,
              total: attempt.total,
            }
          : {
              kind: "diagnostic",
              slug: attempt.diagnosticSlug,
              title: titleFromSlug(attempt.diagnosticSlug),
              subject: null,
              questionCount: attempt.total,
              bestScore: attempt.percent,
            },
    })
  }

  const selectedSlug = payload && "slug" in payload ? payload.slug : undefined
  const canPublish = type === "learning" ? caption.trim().length > 0 : Boolean(payload)

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex gap-1.5">
        {POST_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              type === t.key ? "bg-green-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {type === "learning" ? (
        <textarea
          value={caption}
          onChange={(e) => vm.setComposerField({ caption: e.target.value })}
          placeholder="What did you learn today?"
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-green-500"
        />
      ) : (
        <div className="space-y-2">
          {attemptsLoading ? (
            <p className="text-xs text-muted-foreground">Loading your attempts…</p>
          ) : (
            <>
              {(type === "score" || type === "quizShare") && (
                <AttemptList
                  label="Pick a test attempt"
                  attempts={type === "quizShare" ? dedupeBySlugLatest(testAttempts, (a) => a.testSlug, (a) => a.takenAt) : testAttempts}
                  slugOf={(a) => a.testSlug}
                  onSelect={selectTestAttempt}
                  selectedSlug={selectedSlug}
                />
              )}
              {(type === "score" || type === "examShare") && (
                <AttemptList
                  label="Pick a diagnostic (exam) attempt"
                  attempts={
                    type === "examShare"
                      ? dedupeBySlugLatest(diagnosticAttempts, (a) => a.diagnosticSlug, (a) => a.takenAt)
                      : diagnosticAttempts
                  }
                  slugOf={(a) => a.diagnosticSlug}
                  onSelect={selectDiagnosticAttempt}
                  selectedSlug={selectedSlug}
                />
              )}
            </>
          )}
          <input
            type="text"
            value={caption}
            onChange={(e) => vm.setComposerField({ caption: e.target.value })}
            placeholder="Add a caption (optional)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-green-500"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="brand"
          size="sm"
          className="gap-1.5 rounded-full"
          disabled={!canPublish || vm.composerSubmitting}
          onClick={() => vm.submitPost()}
        >
          <Send className="size-3.5" />
          {vm.composerSubmitting ? "Posting…" : "Post"}
        </Button>
      </div>
    </div>
  )
}

function PostAvatar({ name, username }: { name: string | null; username: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
      {initialsFor(name, username)}
    </span>
  )
}

function PostContentPreview({ post }: { post: FeedPost }) {
  if (post.type === "score" && isScorePayload(post.payload)) {
    const percent = Math.round((post.payload.score / post.payload.total) * 100)
    return (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2">
        <Trophy className="size-4 text-amber-500" />
        <p className="text-sm font-medium text-foreground">
          {post.payload.title} — {post.payload.score}/{post.payload.total} ({percent}%)
        </p>
      </div>
    )
  }
  if (isSharedContentPayload(post.payload)) {
    return (
      <div className="mt-2 rounded-xl border border-border bg-muted/50 px-3 py-2">
        <p className="text-sm font-medium text-foreground">{post.payload.title}</p>
        <p className="text-xs text-muted-foreground">
          {post.payload.questionCount} questions
          {post.payload.bestScore !== null ? ` · Best: ${post.payload.bestScore}%` : ""}
        </p>
      </div>
    )
  }
  return null
}

function PostCard({ post, vm }: { post: FeedPost; vm: CommunitiesViewModel }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const comments = vm.commentsByPostId[post.id] ?? []
  const commentsLoading = vm.commentsLoadingByPostId[post.id]

  const toggleComments = () => {
    const next = !commentsOpen
    setCommentsOpen(next)
    if (next && comments.length === 0) vm.loadComments(post.id)
  }

  const submitComment = () => {
    const body = commentDraft.trim()
    if (!body) return
    setCommentDraft("")
    vm.handleAddComment(post.id, body)
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <PostAvatar name={post.author?.name ?? null} username={post.author?.username ?? "?"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {post.author?.name || post.author?.username || "Someone"}
            </p>
            <Badge variant="muted">{typeLabel(post.type)}</Badge>
          </div>
          {post.caption && <p className="mt-1 text-sm text-foreground">{post.caption}</p>}
          <PostContentPreview post={post} />

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <button
              type="button"
              disabled={vm.pendingReactions.has(post.id)}
              onClick={() => vm.handleReact(post.id, "like")}
              className={`flex items-center gap-1 transition ${
                post.viewerReaction === "like" ? "text-green-600" : "hover:text-foreground"
              }`}
            >
              <Heart className="size-4" />
              {post.reactionCount > 0 ? post.reactionCount : "Like"}
            </button>
            <button
              type="button"
              disabled={vm.pendingReactions.has(post.id)}
              onClick={() => vm.handleReact(post.id, "clap")}
              className={`flex items-center gap-1 transition ${
                post.viewerReaction === "clap" ? "text-green-600" : "hover:text-foreground"
              }`}
            >
              <PartyPopper className="size-4" />
              Clap
            </button>
            <button type="button" onClick={toggleComments} className="flex items-center gap-1 hover:text-foreground">
              <MessageCircle className="size-4" />
              {post.commentCount > 0 ? post.commentCount : "Comment"}
            </button>
          </div>

          {commentsOpen && (
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              {commentsLoading ? (
                <p className="text-xs text-muted-foreground">Loading comments…</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <PostAvatar name={comment.author?.name ?? null} username={comment.author?.username ?? "?"} />
                    <div className="min-w-0 rounded-xl bg-muted px-3 py-1.5">
                      <p className="text-xs font-semibold text-foreground">
                        {comment.author?.name || comment.author?.username || "Someone"}
                      </p>
                      <p className="text-sm text-foreground">{comment.body}</p>
                    </div>
                  </div>
                ))
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitComment()
                  }}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-green-500"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={submitComment}
                  disabled={!commentDraft.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

function EmptyFeedState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
      <p className="mb-1 text-sm font-semibold text-foreground">No posts yet</p>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Join a community or share your first score to get the feed going.
      </p>
    </div>
  )
}

export function FeedView({ vm }: { vm: CommunitiesViewModel }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Feed</h2>
        <ScopeSelector vm={vm} />
      </div>

      <Composer vm={vm} />

      {vm.feedLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-muted/50" />
          ))}
        </div>
      ) : vm.feedItems.length === 0 ? (
        <EmptyFeedState />
      ) : (
        <ul className="space-y-3">
          {vm.feedItems.map((post) => (
            <PostCard key={post.id} post={post} vm={vm} />
          ))}
        </ul>
      )}

      {vm.hasMore && !vm.feedLoading && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={vm.feedLoadingMore}
            onClick={() => vm.loadMoreFeed()}
          >
            {vm.feedLoadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
