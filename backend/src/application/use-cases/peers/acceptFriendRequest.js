const { NotFoundError } = require("../../../domain/errors");

/** @param {{ friendshipRepository: import("../../../domain/ports").FriendshipRepository }} deps */
function makeAcceptFriendRequest({ friendshipRepository }) {
  return async function acceptFriendRequest(viewerId, requestId) {
    const friendship = await friendshipRepository.findById(requestId);
    // Not found / not addressed to this viewer / already resolved all read
    // as "not found" — avoids confirming a request's existence to someone
    // it isn't addressed to.
    if (!friendship || friendship.status !== "pending" || !friendship.isRecipient(viewerId)) {
      throw new NotFoundError("Friend request not found.");
    }
    return friendshipRepository.accept(requestId);
  };
}

module.exports = makeAcceptFriendRequest;
