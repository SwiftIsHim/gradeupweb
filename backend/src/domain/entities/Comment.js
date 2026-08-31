const { ValidationError } = require("../errors");

/** A comment on a post. */
class Comment {
  constructor({ id, postId, userId, body, createdAt }) {
    this.id = id;
    this.postId = postId;
    this.userId = userId;
    this.body = body;
    this.createdAt = createdAt ?? null;
  }

  static create({ postId, userId, body }) {
    if (!postId || !userId) {
      throw new ValidationError("Both a post and a user are required to create a comment.");
    }
    const trimmed = String(body ?? "").trim();
    if (!trimmed || trimmed.length > 500) {
      throw new ValidationError("Comment must be 1-500 characters.", { field: "body" });
    }
    return new Comment({ postId, userId, body: trimmed });
  }

  toPublic() {
    return { id: this.id, postId: this.postId, userId: this.userId, body: this.body, createdAt: this.createdAt };
  }
}

module.exports = Comment;
