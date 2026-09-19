const { NotFoundError } = require("../../../domain/errors");

/** @param {{ friendshipRepository: import("../../../domain/ports").FriendshipRepository }} deps */
function makeDeclineFriendRequest({ friendshipRepository }) {
  return async function declineFriendRequest(viewerId, requestId) {
    const friendship = await friendshipRepository.findById(requestId);
    if (!friendship || friendship.status !== "pending" || !friendship.isRecipient(viewerId)) {
      throw new NotFoundError("Friend request not found.");
    }
    // Deleted, not soft-declined, so the pair can freely re-request later.
    await friendshipRepository.deleteById(requestId);
  };
}

module.exports = makeDeclineFriendRequest;
