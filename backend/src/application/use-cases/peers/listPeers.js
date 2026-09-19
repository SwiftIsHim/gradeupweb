/**
 * @param {{
 *   userRepository: import("../../../domain/ports").UserRepository,
 *   friendshipRepository: import("../../../domain/ports").FriendshipRepository,
 *   getStudyStreak: (userId: string) => Promise<number>,
 * }} deps
 */
function makeListPeers({ userRepository, friendshipRepository, getStudyStreak }) {
  return async function listPeers(viewerId) {
    const relationships = await friendshipRepository.listAllInvolving(viewerId);
    const accepted = relationships.filter((f) => f.status === "accepted");
    if (!accepted.length) return [];

    const peerIds = accepted.map((f) => f.otherUserId(viewerId));

    const [users, batchFriendships, streaks] = await Promise.all([
      userRepository.findByIds(peerIds),
      // One query covering every accepted edge touching the viewer or any of
      // their peers — enough to compute mutual-friend counts without N+1s.
      friendshipRepository.listAcceptedAmong([viewerId, ...peerIds]),
      Promise.all(peerIds.map((id) => getStudyStreak(id))),
    ]);

    const friendsOf = new Map();
    const addEdge = (a, b) => {
      if (!friendsOf.has(a)) friendsOf.set(a, new Set());
      friendsOf.get(a).add(b);
    };
    for (const f of batchFriendships) {
      const a = String(f.requesterId);
      const b = String(f.recipientId);
      addEdge(a, b);
      addEdge(b, a);
    }
    const viewerFriends = friendsOf.get(String(viewerId)) ?? new Set();

    const userById = new Map(users.map((u) => [String(u.id), u]));
    const streakByPeerId = new Map(peerIds.map((id, i) => [String(id), streaks[i]]));
    const friendshipByPeerId = new Map(accepted.map((f) => [String(f.otherUserId(viewerId)), f]));

    return peerIds
      .map((id) => {
        const user = userById.get(String(id));
        if (!user) return null;
        const peerFriends = friendsOf.get(String(id)) ?? new Set();
        const mutualCount = [...viewerFriends].filter((fid) => peerFriends.has(fid)).length;
        return {
          ...user.toPeerSummary(),
          streakDays: streakByPeerId.get(String(id)) ?? 0,
          mutualCount,
          friendsSince: friendshipByPeerId.get(String(id))?.respondedAt ?? null,
        };
      })
      .filter(Boolean);
  };
}

module.exports = makeListPeers;
