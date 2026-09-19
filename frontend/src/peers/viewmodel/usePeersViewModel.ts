import { useCallback, useEffect, useRef, useState } from "react"

import type {
  Peer,
  PeerRequests,
  PeerSearchResult,
  PeersTab,
} from "@/src/peers/model/peers"
import {
  acceptPeerRequestClient,
  cancelPeerRequestClient,
  declinePeerRequestClient,
  fetchPeerRequestsClient,
  fetchPeersClient,
  searchPeersClient,
  sendPeerRequestClient,
} from "@/src/peers/data/peersClient"

const SEARCH_DEBOUNCE_MS = 300

export function usePeersViewModel() {
  const [activeTab, setActiveTab] = useState<PeersTab>("discover")
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<PeerSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [peers, setPeers] = useState<Peer[]>([])
  const [peersLoading, setPeersLoading] = useState(true)

  const [requests, setRequests] = useState<PeerRequests>({ incoming: [], outgoing: [] })
  const [requestsLoading, setRequestsLoading] = useState(true)

  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Loading flags start `true` (see useState above) and only ever get set
  // back to `false` here, asynchronously, after the fetch settles — these
  // are re-used for post-mutation refetches too, where a silent update
  // (no loading flash) is the better UX anyway.
  const loadPeers = useCallback(async () => {
    try {
      setPeers(await fetchPeersClient())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your peers.")
    } finally {
      setPeersLoading(false)
    }
  }, [])

  const loadRequests = useCallback(async () => {
    try {
      setRequests(await fetchPeerRequestsClient())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your requests.")
    } finally {
      setRequestsLoading(false)
    }
  }, [])

  // Initial load, inlined as .then()/.catch()/.finally() rather than calling
  // loadPeers()/loadRequests() directly — matches the cancelled-guard pattern
  // in courses/view/loaders.tsx's useStudyData and keeps every setState call
  // inside an async callback instead of the effect body itself.
  useEffect(() => {
    let cancelled = false

    fetchPeersClient()
      .then((data) => {
        if (!cancelled) setPeers(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your peers.")
        }
      })
      .finally(() => {
        if (!cancelled) setPeersLoading(false)
      })

    fetchPeerRequestsClient()
      .then((data) => {
        if (!cancelled) setRequests(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your requests.")
        }
      })
      .finally(() => {
        if (!cancelled) setRequestsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()
    if (!trimmed) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        setSearchResults(await searchPeersClient(trimmed))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed.")
      } finally {
        setSearchLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
  }, [])

  const handleAddFriend = useCallback(
    (peerId: string) =>
      withPending(peerId, async () => {
        await sendPeerRequestClient(peerId)
        setSearchResults((prev) =>
          prev.map((p) =>
            p.id === peerId ? { ...p, relationshipStatus: "pending_outgoing" as const } : p,
          ),
        )
        await loadRequests()
      }),
    [withPending, loadRequests],
  )

  const handleAcceptRequest = useCallback(
    (requestId: string) =>
      withPending(requestId, async () => {
        await acceptPeerRequestClient(requestId)
        await Promise.all([loadPeers(), loadRequests()])
      }),
    [withPending, loadPeers, loadRequests],
  )

  const handleDeclineRequest = useCallback(
    (requestId: string) =>
      withPending(requestId, async () => {
        await declinePeerRequestClient(requestId)
        await loadRequests()
      }),
    [withPending, loadRequests],
  )

  const handleCancelRequest = useCallback(
    (requestId: string) =>
      withPending(requestId, async () => {
        await cancelPeerRequestClient(requestId)
        await loadRequests()
      }),
    [withPending, loadRequests],
  )

  return {
    activeTab,
    setActiveTab,
    error,

    searchQuery,
    searchResults,
    searchLoading,
    handleSearch,
    handleAddFriend,

    peers,
    peersLoading,
    hasPeers: peers.length > 0,

    requests,
    requestsLoading,
    pendingRequestCount: requests.incoming.length,
    handleAcceptRequest,
    handleDeclineRequest,
    handleCancelRequest,

    isPending: (id: string) => pendingIds.has(id),
  }
}
