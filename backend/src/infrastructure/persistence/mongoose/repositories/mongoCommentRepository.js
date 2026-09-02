const CommentModel = require("../schemas/comment.schema");
const Comment = require("../../../../domain/entities/Comment");

function toEntity(doc) {
  if (!doc) return null;
  return new Comment({
    id: doc._id ? String(doc._id) : undefined,
    postId: doc.post ? String(doc.post) : undefined,
    userId: doc.user ? String(doc.user) : undefined,
    body: doc.body,
    createdAt: doc.createdAt,
  });
}

const LIST_LIMIT = 200;

/** @implements {import("../../../../domain/ports").CommentRepository} */
const mongoCommentRepository = {
  async create(comment) {
    const doc = await CommentModel.create({ post: comment.postId, user: comment.userId, body: comment.body });
    return toEntity(doc);
  },

  async listByPost(postId) {
    const docs = await CommentModel.find({ post: postId }).sort({ createdAt: 1 }).limit(LIST_LIMIT).lean();
    return docs.map(toEntity);
  },

  async deleteByPostId(postId) {
    await CommentModel.deleteMany({ post: postId });
  },
};

module.exports = mongoCommentRepository;
