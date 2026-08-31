"use client";

import { Check, Flame, Search, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  initialsFor,
  type FriendRequest,
  type Peer,
  type PeerSearchResult,
  type PeerSummary,
  type RelationshipStatus,
} from "@/src/peers/model/peers";
import { usePeersViewModel } from "../viewmodel/usePeersViewModel";
import { useCommunitiesViewModel } from "@/src/communities/viewmodel/useCommunitiesViewModel";
import { CommunityDiscoveryView } from "@/src/communities/view/communityDiscovery";
import { FeedView } from "@/src/communities/view/feed";

const TABS = [
  { key: "discover", label: "Discover" },
  { key: "peers", label: "My Peers" },
  { key: "requests", label: "Requests" },
  { key: "communities", label: "Communities" },
  { key: "feed", label: "Feed" },
] as const;

export function PeersView() {
  const vm = usePeersViewModel();
  const communitiesVm = useCommunitiesViewModel();

  const openCommunityFeed = (communityId: string) => {
    communitiesVm.setActiveScope({ kind: "community", communityId });
    vm.setActiveTab("feed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-6 text-3xl font-bold text-foreground">Peers</h1>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Find friends by username or name..."
            value={vm.searchQuery}
            onChange={(e) => {
              vm.handleSearch(e.target.value);
              vm.setActiveTab("discover");
            }}
            className="w-full rounded-full border border-border bg-muted py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {vm.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {vm.error}
        </div>
      )}
      {communitiesVm.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {communitiesVm.error}
        </div>
      )}

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => vm.setActiveTab(tab.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${
              vm.activeTab === tab.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.key === "requests" && vm.pendingRequestCount > 0 && (
              <span className="ml-1.5 rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {vm.pendingRequestCount}
              </span>
            )}
            {vm.activeTab === tab.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-green-600" />
            )}
          </button>
        ))}
      </div>

      {vm.activeTab === "discover" && (
        <DiscoverTab
          query={vm.searchQuery}
          loading={vm.searchLoading}
          results={vm.searchResults}
          isPending={vm.isPending}
          onAdd={vm.handleAddFriend}
        />
      )}

      {vm.activeTab === "peers" && (
        <PeersTab
          loading={vm.peersLoading}
          peers={vm.peers}
          onFindFriends={() => vm.setActiveTab("discover")}
        />
      )}

      {vm.activeTab === "requests" && (
        <RequestsTab
          loading={vm.requestsLoading}
          incoming={vm.requests.incoming}
          outgoing={vm.requests.outgoing}
          isPending={vm.isPending}
          onAccept={vm.handleAcceptRequest}
          onDecline={vm.handleDeclineRequest}
          onCancel={vm.handleCancelRequest}
        />
      )}

      {vm.activeTab === "communities" && (
        <CommunityDiscoveryView vm={communitiesVm} onOpenCommunityFeed={openCommunityFeed} />
      )}

      {vm.activeTab === "feed" && <FeedView vm={communitiesVm} />}
    </div>
  );
}

function PeerAvatar({ name, username }: { name: string | null; username: string }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
      {initialsFor(name, username)}
    </span>
  );
}

function PeerIdentity({ peer }: { peer: PeerSummary }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-foreground">
        {peer.name || peer.username}
      </p>
      <p className="truncate text-xs text-muted-foreground">@{peer.username}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-6 rounded-full bg-blue-50 p-6">
        <Users className="h-12 w-12 text-blue-400" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  );
}

function DiscoverTab({
  query,
  loading,
  results,
  isPending,
  onAdd,
}: {
  query: string;
  loading: boolean;
  results: PeerSearchResult[];
  isPending: (id: string) => boolean;
  onAdd: (id: string) => void;
}) {
  if (!query.trim()) {
    return (
      <EmptyState
        title="Find your peers"
        description="Search by username or name to connect with classmates preparing for the same exam."
      />
    );
  }

  if (loading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Searching…</p>;
  }

  if (results.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No one found matching &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
      {results.map((peer) => (
        <li key={peer.id} className="flex items-center gap-3 px-4 py-3.5">
          <PeerAvatar name={peer.name} username={peer.username} />
          <div className="flex-1">
            <PeerIdentity peer={peer} />
          </div>
          <RelationshipAction id={peer.id} status={peer.relationshipStatus} pending={isPending(peer.id)} onAdd={onAdd} />
        </li>
      ))}
    </ul>
  );
}

function RelationshipAction({
  id,
  status,
  pending,
  onAdd,
}: {
  id: string;
  status: RelationshipStatus;
  pending: boolean;
  onAdd: (id: string) => void;
}) {
  if (status === "friends") {
    return (
      <Badge variant="muted" className="gap-1">
        <Check className="size-3.5" /> Friends
      </Badge>
    );
  }
  if (status === "pending_outgoing") {
    return (
      <Badge variant="muted">Requested</Badge>
    );
  }
  if (status === "pending_incoming") {
    return <Badge variant="brand">Respond in Requests</Badge>;
  }
  return (
    <Button
      variant="brand"
      size="sm"
      className="rounded-full"
      disabled={pending}
      onClick={() => onAdd(id)}
    >
      {pending ? "Sending…" : "Add friend"}
    </Button>
  );
}

function PeersTab({
  loading,
  peers,
  onFindFriends,
}: {
  loading: boolean;
  peers: Peer[];
  onFindFriends: () => void;
}) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading your peers…</p>;
  }

  if (peers.length === 0) {
    return (
      <EmptyState
        title="No peers yet"
        description="Connect with classmates and friends to share progress, join study groups, and level up together."
        action={
          <Button
            onClick={onFindFriends}
            className="rounded-full bg-green-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Add friends
          </Button>
        }
      />
    );
  }

  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
      {peers.map((peer) => (
        <li key={peer.id} className="flex items-center gap-3 px-4 py-3.5">
          <PeerAvatar name={peer.name} username={peer.username} />
          <div className="flex-1">
            <PeerIdentity peer={peer} />
          </div>
          <div className="flex items-center gap-3">
            {peer.mutualCount > 0 && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {peer.mutualCount} mutual {peer.mutualCount === 1 ? "peer" : "peers"}
              </span>
            )}
            <Badge variant="brand" className="gap-1.5">
              <Flame className="size-3.5" />
              {peer.streakDays > 0 ? `${peer.streakDays} day streak` : "No streak yet"}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

function RequestsTab({
  loading,
  incoming,
  outgoing,
  isPending,
  onAccept,
  onDecline,
  onCancel,
}: {
  loading: boolean;
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  isPending: (id: string) => boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading requests…</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Incoming ({incoming.length})
        </h2>
        {incoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No incoming requests.</p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {incoming.map((request) =>
              request.peer ? (
                <li key={request.id} className="flex items-center gap-3 px-4 py-3.5">
                  <PeerAvatar name={request.peer.name} username={request.peer.username} />
                  <div className="flex-1">
                    <PeerIdentity peer={request.peer} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="brand"
                      size="icon-sm"
                      className="rounded-full"
                      disabled={isPending(request.id)}
                      onClick={() => onAccept(request.id)}
                      aria-label="Accept"
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-full"
                      disabled={isPending(request.id)}
                      onClick={() => onDecline(request.id)}
                      aria-label="Decline"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Outgoing ({outgoing.length})
        </h2>
        {outgoing.length === 0 ? (
          <p className="text-sm text-muted-foreground">No outgoing requests.</p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {outgoing.map((request) =>
              request.peer ? (
                <li key={request.id} className="flex items-center gap-3 px-4 py-3.5">
                  <PeerAvatar name={request.peer.name} username={request.peer.username} />
                  <div className="flex-1">
                    <PeerIdentity peer={request.peer} />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={isPending(request.id)}
                    onClick={() => onCancel(request.id)}
                  >
                    Cancel
                  </Button>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
