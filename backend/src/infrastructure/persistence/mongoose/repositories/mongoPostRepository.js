const PostModel = require("../schemas/post.schema");
const Post = require("../../../../domain/entities/Post");

function toEntity(doc) {
  if (!doc) return null;
  return new Post({
    id: doc._id ? String(doc._id) : undefined,
    authorId: doc.author ? String(doc.author) : undefined,
    communityId: doc.community ? String(doc.community) : null,
    type: doc.type,
    caption: doc.caption,
    payload: doc.payload,
    reactionCount: doc.reactionCount,
    commentCount: doc.commentCount,
    createdAt: doc.createdAt,
  });
}

function encodeCursor(doc) {
  return Buffer.from(`${doc.createdAt.toISOString()}|${doc._id}`, "utf8").toString("base64");
}

function decodeCursor(cursor) {
  const [iso, id] = Buffer.from(cursor, "base64").toString("utf8").split("|");
  return { createdAt: new Date(iso), id };
}

/** @implements {import("../../../../domain/ports").PostRepository} */
const mongoPostRepository = {
  async create(post) {
    const doc = await PostModel.create({
      author: post.authorId,
      community: post.communityId,
      type: post.type,
      caption: post.caption,
      payload: post.payload,
      reactionCount: post.reactionCount,
      commentCount: post.commentCount,
    });
    return toEntity(doc);
  },

  async findById(id) {
    const doc = await PostModel.findById(id).lean().catch(() => null);
    return toEntity(doc);
  },

  async findLatestByAuthor(authorId) {
    const doc = await PostModel.findOne({ author: authorId }).sort({ createdAt: -1 }).lean();
    return toEntity(doc);
  },

  async listFeed({ communityId, joinedCommunityIds = [], cursor, limit }) {
    const filter = communityId
      ? { community: communityId }
      : { $or: [{ community: null }, { community: { $in: joinedCommunityIds } }] };

    if (cursor) {
      const { createdAt, id } = decodeCursor(cursor);
      filter.$and = [
        ...(filter.$and ?? []),
        { $or: [{ createdAt: { $lt: createdAt } }, { createdAt, _id: { $lt: id } }] },
      ];
    }

    const docs = await PostModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const page = hasMore ? docs.slice(0, limit) : docs;

    return {
      items: page.map(toEntity),
      nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
    };
  },

  async deleteById(id) {
    await PostModel.deleteOne({ _id: id });
  },

  async incrementReactionCount(postId, delta) {
    await PostModel.updateOne({ _id: postId }, { $inc: { reactionCount: delta } });
  },

  async incrementCommentCount(postId, delta) {
    await PostModel.updateOne({ _id: postId }, { $inc: { commentCount: delta } });
  },
};

module.exports = mongoPostRepository;
