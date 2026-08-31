const { NotFoundError } = require("../../../domain/errors");

/** @param {{ friendshipRepository: import("../../../domain/ports").FriendshipRepository }} deps */
function makeCancelFriendRequest({ friendshipRepository }) {
  return async function cancelFriendRequest(viewerId, requestId) {
    const friendship = await friendshipRepository.findById(requestId);
    if (!friendship || friendship.status !== "pending" || !friendship.isRequester(viewerId)) {
      throw new NotFoundError("Friend request not found.");
    }
    await friendshipRepository.deleteById(requestId);
  };
}

module.exports = makeCancelFriendRequest;
