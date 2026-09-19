const { ValidationError } = require("../../../domain/errors");

function relationshipStatusFor(friendship, viewerId) {
  if (!friendship) return "none";
  if (friendship.status === "accepted") return "friends";
  return friendship.isRequester(viewerId) ? "pending_outgoing" : "pending_incoming";
}

/**
 * @param {{
 *   userRepository: import("../../../domain/ports").UserRepository,
 *   friendshipRepository: import("../../../domain/ports").FriendshipRepository,
 * }} deps
 */
function makeSearchUsers({ userRepository, friendshipRepository }) {
  return async function searchUsers(viewerId, rawQuery) {
    const query = String(rawQuery || "").trim();
    if (!query) {
      throw new ValidationError("A search query is required.", { field: "q" });
    }

    const [candidates, relationships] = await Promise.all([
      userRepository.searchByUsernameOrName(query, { excludeId: viewerId, limit: 20 }),
      friendshipRepository.listAllInvolving(viewerId),
    ]);

    const relationshipByOtherId = new Map(relationships.map((f) => [String(f.otherUserId(viewerId)), f]));

    // Identity only — no streak/mutual count for people who aren't peers yet.
    return candidates.map((user) => ({
      ...user.toPeerSummary(),
      relationshipStatus: relationshipStatusFor(relationshipByOtherId.get(String(user.id)), viewerId),
    }));
  };
}

module.exports = makeSearchUsers;
