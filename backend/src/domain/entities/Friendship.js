const { ValidationError } = require("../errors");

/**
 * A friend relationship between two users. Only two statuses exist:
 * `pending` (requested, awaiting a response) and `accepted`. Decline/cancel
 * are modeled as deleting the document (see mongoFriendshipRepository),
 * not a third "declined" status — that keeps the duplicate-request guard
 * (a unique index on the pair) from permanently blocking a re-request.
 */
class Friendship {
  constructor({ id, requesterId, recipientId, status, createdAt, respondedAt }) {
    this.id = id;
    this.requesterId = requesterId;
    this.recipientId = recipientId;
    this.status = status;
    this.createdAt = createdAt ?? null;
    this.respondedAt = respondedAt ?? null;
  }

  /** Build a new (not-yet-persisted) pending friend request. */
  static request(requesterId, recipientId) {
    if (!requesterId || !recipientId) {
      throw new ValidationError("Both users are required to create a friend request.");
    }
    if (String(requesterId) === String(recipientId)) {
      throw new ValidationError("You can't send a friend request to yourself.");
    }
    return new Friendship({ requesterId, recipientId, status: "pending" });
  }

  accept() {
    if (this.status !== "pending") {
      throw new ValidationError("Only a pending request can be accepted.");
    }
    this.status = "accepted";
    this.respondedAt = new Date();
  }

  /** The user on the other side of this relationship, relative to `viewerId`. */
  otherUserId(viewerId) {
    return String(this.requesterId) === String(viewerId) ? this.recipientId : this.requesterId;
  }

  isRecipient(userId) {
    return String(this.recipientId) === String(userId);
  }

  isRequester(userId) {
    return String(this.requesterId) === String(userId);
  }

  toPublic() {
    return {
      id: this.id,
      requesterId: this.requesterId,
      recipientId: this.recipientId,
      status: this.status,
      createdAt: this.createdAt,
      respondedAt: this.respondedAt,
    };
  }
}

module.exports = Friendship;
