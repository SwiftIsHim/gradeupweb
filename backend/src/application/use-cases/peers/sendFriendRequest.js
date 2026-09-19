const Friendship = require("../../../domain/entities/Friendship");
const { ConflictError, NotFoundError } = require("../../../domain/errors");

/**
 * @param {{
 *   userRepository: import("../../../domain/ports").UserRepository,
 *   friendshipRepository: import("../../../domain/ports").FriendshipRepository,
 * }} deps
 */
function makeSendFriendRequest({ userRepository, friendshipRepository }) {
  return async function sendFriendRequest(viewerId, recipientId) {
    const [recipient] = await userRepository.findByIds([recipientId]);
    if (!recipient) {
      throw new NotFoundError("That user doesn't exist.");
    }

    // Self-add is also rejected by Friendship.request() below; checking
    // existing state first gives a clearer message for the common case.
    const existing = await friendshipRepository.findBetween(viewerId, recipientId);
    if (existing) {
      throw new ConflictError(
        existing.status === "accepted"
          ? "You're already peers."
          : "A friend request already exists between you two."
      );
    }

    const friendship = Friendship.request(viewerId, recipientId);
    return friendshipRepository.create(friendship);
  };
}

module.exports = makeSendFriendRequest;
