const FriendshipModel = require("../schemas/friendship.schema");
const Friendship = require("../../../../domain/entities/Friendship");
const { ConflictError } = require("../../../../domain/errors");

function toEntity(doc) {
  if (!doc) return null;
  return new Friendship({
    id: doc._id ? String(doc._id) : undefined,
    requesterId: doc.requester ? String(doc.requester) : undefined,
    recipientId: doc.recipient ? String(doc.recipient) : undefined,
    status: doc.status,
    createdAt: doc.createdAt,
    respondedAt: doc.respondedAt,
  });
}

/** Sorted pair, so (A,B) and (B,A) collide on the same unique index slot. */
function sortedPair(idA, idB) {
  return String(idA) < String(idB) ? [idA, idB] : [idB, idA];
}

/** @implements {import("../../../../domain/ports").FriendshipRepository} */
const mongoFriendshipRepository = {
  async create(friendship) {
    const [userLow, userHigh] = sortedPair(friendship.requesterId, friendship.recipientId);
    try {
      const doc = await FriendshipModel.create({
        requester: friendship.requesterId,
        recipient: friendship.recipientId,
        status: friendship.status,
        userLow,
        userHigh,
      });
      return toEntity(doc);
    } catch (err) {
      if (err && err.code === 11000) {
        throw new ConflictError("A friend request already exists between these users.");
      }
      throw err;
    }
  },

  async findById(id) {
    const doc = await FriendshipModel.findById(id).lean().catch(() => null);
    return toEntity(doc);
  },

  async findBetween(userIdA, userIdB) {
    const [userLow, userHigh] = sortedPair(userIdA, userIdB);
    const doc = await FriendshipModel.findOne({ userLow, userHigh }).lean();
    return toEntity(doc);
  },

  async listAllInvolving(userId) {
    const docs = await FriendshipModel.find({
      $or: [{ requester: userId }, { recipient: userId }],
    }).lean();
    return docs.map(toEntity);
  },

  async listAcceptedAmong(userIds) {
    const docs = await FriendshipModel.find({
      status: "accepted",
      $or: [{ requester: { $in: userIds } }, { recipient: { $in: userIds } }],
    }).lean();
    return docs.map(toEntity);
  },

  async accept(id) {
    const doc = await FriendshipModel.findOneAndUpdate(
      { _id: id, status: "pending" },
      { status: "accepted", respondedAt: new Date() },
      { new: true }
    ).lean();
    return toEntity(doc);
  },

  async deleteById(id) {
    await FriendshipModel.deleteOne({ _id: id });
  },
};

module.exports = mongoFriendshipRepository;
