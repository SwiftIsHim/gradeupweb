"use client"

import { useState } from "react"
import { Plus, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Community } from "@/src/communities/model/communities"
import type { CommunitiesViewModel } from "@/src/communities/viewmodel/useCommunitiesViewModel"

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-6 rounded-full bg-blue-50 p-6">
        <Users className="h-12 w-12 text-blue-400" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function CommunityRow({
  community,
  pending,
  onJoin,
  onLeave,
  onOpen,
}: {
  community: Community
  pending: boolean
  onJoin: (id: string) => void
  onLeave: (id: string) => void
  onOpen: (id: string) => void
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <button
        type="button"
        onClick={() => onOpen(community.id)}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-sm font-semibold text-foreground">{community.name}</p>
        {community.description && (
          <p className="truncate text-xs text-muted-foreground">{community.description}</p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {community.memberCount} {community.memberCount === 1 ? "member" : "members"}
          {community.examTag ? ` · ${community.examTag}` : ""}
        </p>
      </button>
      {community.isMember ? (
        <Button variant="outline" size="sm" className="rounded-full" disabled={pending} onClick={() => onLeave(community.id)}>
          {pending ? "Leaving…" : "Leave"}
        </Button>
      ) : (
        <Button variant="brand" size="sm" className="rounded-full" disabled={pending} onClick={() => onJoin(community.id)}>
          {pending ? "Joining…" : "Join"}
        </Button>
      )}
    </li>
  )
}

function CreateCommunityForm({ vm }: { vm: CommunitiesViewModel }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [examTag, setExamTag] = useState("")

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        Create a community
      </Button>
    )
  }

  const submit = async () => {
    if (!name.trim()) return
    await vm.handleCreateCommunity({ name: name.trim(), description: description.trim(), examTag: examTag.trim() || null })
    setName("")
    setDescription("")
    setExamTag("")
    setOpen(false)
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <input
        type="text"
        placeholder="Community name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-green-500"
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-green-500"
      />
      <input
        type="text"
        placeholder="Exam tag, e.g. JAMB (optional)"
        value={examTag}
        onChange={(e) => setExamTag(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-green-500"
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="brand"
          size="sm"
          className="rounded-full"
          disabled={!name.trim() || vm.isPending("create-community")}
          onClick={submit}
        >
          {vm.isPending("create-community") ? "Creating…" : "Create"}
        </Button>
      </div>
    </div>
  )
}

export function CommunityDiscoveryView({
  vm,
  onOpenCommunityFeed,
}: {
  vm: CommunitiesViewModel
  onOpenCommunityFeed: (communityId: string) => void
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search communities by name, subject, or exam..."
            value={vm.discoverQuery}
            onChange={(e) => vm.handleDiscoverSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-muted py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <CreateCommunityForm vm={vm} />
      </div>

      {vm.discoverQuery.trim() && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Search results</h2>
          {vm.discoverLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Searching…</p>
          ) : vm.discoverResults.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No communities found matching &ldquo;{vm.discoverQuery}&rdquo;.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {vm.discoverResults.map((community) => (
                <CommunityRow
                  key={community.id}
                  community={community}
                  pending={vm.isPending(community.id)}
                  onJoin={vm.handleJoin}
                  onLeave={vm.handleLeave}
                  onOpen={onOpenCommunityFeed}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">My communities</h2>
        {vm.joinedLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : vm.joinedCommunities.length === 0 ? (
          <EmptyState
            title="No communities yet"
            description="Join a community built around your exam or subject to share quizzes, scores, and what you're learning."
          />
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {vm.joinedCommunities.map((community) => (
              <CommunityRow
                key={community.id}
                community={community}
                pending={vm.isPending(community.id)}
                onJoin={vm.handleJoin}
                onLeave={vm.handleLeave}
                onOpen={onOpenCommunityFeed}
              />
            ))}
          </ul>
        )}
      </section>

      {vm.suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Suggested for you</h2>
          {vm.suggestionsLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {vm.suggestions.map((community) => (
                <CommunityRow
                  key={community.id}
                  community={community}
                  pending={vm.isPending(community.id)}
                  onJoin={vm.handleJoin}
                  onLeave={vm.handleLeave}
                  onOpen={onOpenCommunityFeed}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
