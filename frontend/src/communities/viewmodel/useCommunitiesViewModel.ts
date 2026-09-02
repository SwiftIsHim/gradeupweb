import { useCallback, useEffect, useRef, useState } from "react"

import {
  EMPTY_COMPOSER_STATE,
  type Community,
  type ComposerState,
  type FeedComment,
  type FeedPost,
  type FeedScope,
} from "@/src/communities/model/communities"
import {
  createCommunityClient,
  discoverCommunitiesClient,
  joinCommunityClient,
  leaveCommunityClient,
  listMyCommunitiesClient,
  listSuggestedCommunitiesClient,
} from "@/src/communities/data/communitiesClient"
import {
  addCommentClient,
  createPostClient,
  getFeedClient,
  listCommentsClient,
  reactToPostClient,
} from "@/src/communities/data/feedClient"

const SEARCH_DEBOUNCE_MS = 300

function scopeCommunityId(scope: FeedScope): string | undefined {
  return scope.kind === "community" ? scope.communityId : undefined
}

function patchCommunityIn(list: Community[], communityId: string, patch: Partial<Community>): Community[] {
  return list.map((c) => (c.id === communityId ? { ...c, ...patch } : c))
}

export function useCommunitiesViewModel() {
  const [error, setError] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const withPending = useCallback(async (id: string, action: () => Promise<void>) => {
    setPendingIds((prev) => new Set(prev).add(id))
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [])

  // ── Discovery ─────────────────────────────────────────────────────────
  const [discoverQuery, setDiscoverQuery] = useState("")
  const [discoverResults, setDiscoverResults] = useState<Community[]>([])
  const [discoverLoading, setDiscoverLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [suggestions, setSuggestions] = useState<Community[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)

  // ── Joined communities + feed scope ──────────────────────────────────
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([])
  const [joinedLoading, setJoinedLoading] = useState(true)
  const [activeScope, setActiveScope] = useState<FeedScope>({ kind: "global" })

  // Initial load, inlined as .then()/.catch()/.finally() rather than calling
  // memoized loaders — matches usePeersViewModel's cancelled-guard pattern.
  useEffect(() => {
    let cancelled = false

    listSuggestedCommunitiesClient()
      .then((data) => {
        if (!cancelled) setSuggestions(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load suggestions.")
      })
      .finally(() => {
        if (!cancelled) setSuggestionsLoading(false)
      })

    listMyCommunitiesClient()
      .then((data) => {
        if (!cancelled) setJoinedCommunities(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your communities.")
      })
      .finally(() => {
        if (!cancelled) setJoinedLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleDiscoverSearch = useCallback((query: string) => {
    setDiscoverQuery(query)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()
    if (!trimmed) {
      setDiscoverResults([])
      setDiscoverLoading(false)
      return
    }

    setDiscoverLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        setDiscoverResults(await discoverCommunitiesClient(trimmed))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed.")
      } finally {
        setDiscoverLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
  }, [])

  const patchCommunityEverywhere = useCallback((communityId: string, patch: Partial<Community>) => {
    setDiscoverResults((prev) => patchCommunityIn(prev, communityId, patch))
    setSuggestions((prev) => patchCommunityIn(prev, communityId, patch))
    setJoinedCommunities((prev) => patchCommunityIn(prev, communityId, patch))
  }, [])

  const handleCreateCommunity = useCallback(
    (input: { name: string; description?: string; examTag?: string | null; subjects?: string[] }) =>
      withPending("create-community", async () => {
        const { community } = await createCommunityClient(input)
        setJoinedCommunities((prev) => [community, ...prev])
      }),
    [withPending],
  )

  const handleJoin = useCallback(
    (communityId: string) =>
      withPending(communityId, async () => {
        const { community } = await joinCommunityClient(communityId)
        patchCommunityEverywhere(communityId, community)
        setJoinedCommunities((prev) => (prev.some((c) => c.id === communityId) ? prev : [community, ...prev]))
      }),
    [withPending, patchCommunityEverywhere],
  )

  const handleLeave = useCallback(
    (communityId: string) =>
      withPending(communityId, async () => {
        await leaveCommunityClient(communityId)
        patchCommunityEverywhere(communityId, { isMember: false, role: null })
        setJoinedCommunities((prev) => prev.filter((c) => c.id !== communityId))
        setActiveScope((prev) =>
          prev.kind === "community" && prev.communityId === communityId ? { kind: "global" } : prev,
        )
      }),
    [withPending, patchCommunityEverywhere],
  )

  // ── Feed ──────────────────────────────────────────────────────────────
  const [feedItems, setFeedItems] = useState<FeedPost[]>([])
  // Loading is derived by comparing the scope the current feedItems were
  // loaded for against the active scope, rather than a boolean flipped
  // synchronously inside the effect (avoids react-hooks/set-state-in-effect —
  // a setState call directly in an effect body causes an extra render).
  const [loadedScopeKey, setLoadedScopeKey] = useState<string | null>(null)
  const [feedLoadingMore, setFeedLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const scopeKey = activeScope.kind === "global" ? "global" : `community:${activeScope.communityId}`
  const feedLoading = loadedScopeKey !== scopeKey

  useEffect(() => {
    let cancelled = false
    const key = activeScope.kind === "global" ? "global" : `community:${activeScope.communityId}`

    getFeedClient({ communityId: scopeCommunityId(activeScope) })
      .then((data) => {
        if (cancelled) return
        setFeedItems(data.items)
        setCursor(data.nextCursor)
        setHasMore(Boolean(data.nextCursor))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the feed.")
      })
      .finally(() => {
        if (!cancelled) setLoadedScopeKey(key)
      })

    return () => {
      cancelled = true
    }
  }, [activeScope])

  const loadMoreFeed = useCallback(async () => {
    if (!cursor || feedLoadingMore) return
    setFeedLoadingMore(true)
    try {
      const data = await getFeedClient({ communityId: scopeCommunityId(activeScope), cursor })
      setFeedItems((prev) => [...prev, ...data.items])
      setCursor(data.nextCursor)
      setHasMore(Boolean(data.nextCursor))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more posts.")
    } finally {
      setFeedLoadingMore(false)
    }
  }, [cursor, feedLoadingMore, activeScope])

  // ── Composer ──────────────────────────────────────────────────────────
  const [composerState, setComposerState] = useState<ComposerState>(EMPTY_COMPOSER_STATE)
  const [composerSubmitting, setComposerSubmitting] = useState(false)

  const setComposerField = useCallback((patch: Partial<ComposerState>) => {
    setComposerState((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetComposer = useCallback(() => setComposerState(EMPTY_COMPOSER_STATE), [])

  // Not truly optimistic: a post can fail server-side (self-spam guard,
  // validation), and rolling back a fully-interactive card is riskier than
  // just disabling the publish button for the round-trip.
  const submitPost = useCallback(async () => {
    setComposerSubmitting(true)
    setError(null)
    try {
      const { post } = await createPostClient({
        communityId: scopeCommunityId(activeScope) ?? null,
        type: composerState.type,
        caption: composerState.caption,
        payload: composerState.payload,
      })
      setFeedItems((prev) => [post, ...prev])
      resetComposer()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish your post.")
    } finally {
      setComposerSubmitting(false)
    }
  }, [activeScope, composerState, resetComposer])

  // ── Reactions (true optimistic — trivial to roll back) ───────────────
  const [pendingReactions, setPendingReactions] = useState<Set<string>>(new Set())

  const handleReact = useCallback(async (postId: string, type: "like" | "clap") => {
    setPendingReactions((prev) => new Set(prev).add(postId))
    setError(null)

    let previous: FeedPost | undefined
    setFeedItems((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post
        previous = post
        const wasSameType = post.viewerReaction === type
        const nowReacted = !wasSameType
        const delta = wasSameType ? -1 : post.viewerReaction ? 0 : 1
        return { ...post, viewerReaction: nowReacted ? type : null, reactionCount: post.reactionCount + delta }
      }),
    )

    try {
      await reactToPostClient(postId, type)
    } catch (err) {
      if (previous) {
        const snapshot = previous
        setFeedItems((prev) => prev.map((post) => (post.id === postId ? snapshot : post)))
      }
      setError(err instanceof Error ? err.message : "Could not react to this post.")
    } finally {
      setPendingReactions((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }, [])

  // ── Comments ──────────────────────────────────────────────────────────
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, FeedComment[]>>({})
  const [commentsLoadingByPostId, setCommentsLoadingByPostId] = useState<Record<string, boolean>>({})

  const loadComments = useCallback(async (postId: string) => {
    setCommentsLoadingByPostId((prev) => ({ ...prev, [postId]: true }))
    try {
      const comments = await listCommentsClient(postId)
      setCommentsByPostId((prev) => ({ ...prev, [postId]: comments }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load comments.")
    } finally {
      setCommentsLoadingByPostId((prev) => ({ ...prev, [postId]: false }))
    }
  }, [])

  const handleAddComment = useCallback(async (postId: string, body: string) => {
    const trimmed = body.trim()
    if (!trimmed) return

    setFeedItems((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)))

    try {
      const { comment } = await addCommentClient(postId, trimmed)
      setCommentsByPostId((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), comment] }))
    } catch (err) {
      setFeedItems((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount - 1 } : p)))
      setError(err instanceof Error ? err.message : "Could not post your comment.")
    }
  }, [])

  return {
    error,
    isPending: (id: string) => pendingIds.has(id),

    discoverQuery,
    discoverResults,
    discoverLoading,
    handleDiscoverSearch,

    suggestions,
    suggestionsLoading,

    joinedCommunities,
    joinedLoading,
    activeScope,
    setActiveScope,

    handleCreateCommunity,
    handleJoin,
    handleLeave,

    feedItems,
    feedLoading,
    feedLoadingMore,
    hasMore,
    loadMoreFeed,

    composerState,
    composerSubmitting,
    setComposerField,
    resetComposer,
    submitPost,

    pendingReactions,
    handleReact,

    commentsByPostId,
    commentsLoadingByPostId,
    loadComments,
    handleAddComment,
  }
}

export type CommunitiesViewModel = ReturnType<typeof useCommunitiesViewModel>
