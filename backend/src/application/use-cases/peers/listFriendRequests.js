/**
 * @param {{
 *   userRepository: import("../../../domain/ports").UserRepository,
 *   friendshipRepository: import("../../../domain/ports").FriendshipRepository,
 * }} deps
 */
function makeListFriendRequests({ userRepository, friendshipRepository }) {
  return async function listFriendRequests(viewerId) {
    const relationships = await friendshipRepository.listAllInvolving(viewerId);
    const pending = relationships.filter((f) => f.status === "pending");

    const otherIds = pending.map((f) => f.otherUserId(viewerId));
    const users = await userRepository.findByIds(otherIds);
    const userById = new Map(users.map((u) => [String(u.id), u]));

    const toDto = (f) => ({
      id: f.id,
      createdAt: f.createdAt,
      peer: userById.get(String(f.otherUserId(viewerId)))?.toPeerSummary() ?? null,
    });

    return {
      incoming: pending.filter((f) => f.isRecipient(viewerId)).map(toDto),
      outgoing: pending.filter((f) => f.isRequester(viewerId)).map(toDto),
    };
  };
}

module.exports = makeListFriendRequests;
