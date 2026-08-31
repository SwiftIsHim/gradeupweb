const ReactionModel = require("../schemas/reaction.schema");
const Reaction = require("../../../../domain/entities/Reaction");
const { ConflictError } = require("../../../../domain/errors");

function toEntity(doc) {
  if (!doc) return null;
  return new Reaction({
    id: doc._id ? String(doc._id) : undefined,
    postId: doc.post ? String(doc.post) : undefined,
    userId: doc.user ? String(doc.user) : undefined,
    type: doc.type,
    createdAt: doc.createdAt,
  });
}

/** @implements {import("../../../../domain/ports").ReactionRepository} */
const mongoReactionRepository = {
  async create(reaction) {
    try {
      const doc = await ReactionModel.create({ post: reaction.postId, user: reaction.userId, type: reaction.type });
      return toEntity(doc);
    } catch (err) {
      if (err && err.code === 11000) {
        throw new ConflictError("You've already reacted to this post.");
      }
      throw err;
    }
  },

  async findOne(postId, userId) {
    const doc = await ReactionModel.findOne({ post: postId, user: userId }).lean();
    return toEntity(doc);
  },

  async deleteOne(postId, userId) {
    await ReactionModel.deleteOne({ post: postId, user: userId });
  },

  async updateType(postId, userId, type) {
    const doc = await ReactionModel.findOneAndUpdate({ post: postId, user: userId }, { type }, { new: true }).lean();
    return toEntity(doc);
  },

  async listByPostIdsForUser(postIds, userId) {
    const docs = await ReactionModel.find({ post: { $in: postIds }, user: userId }).lean();
    return docs.map(toEntity);
  },

  async deleteByPostId(postId) {
    await ReactionModel.deleteMany({ post: postId });
  },
};

module.exports = mongoReactionRepository;
