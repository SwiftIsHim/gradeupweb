const { ValidationError } = require("../errors");

const TYPES = new Set(["like", "clap"]);

/** A reaction to a post. One per (postId, userId) — switching types updates it in place. */
class Reaction {
  constructor({ id, postId, userId, type, createdAt }) {
    this.id = id;
    this.postId = postId;
    this.userId = userId;
    this.type = type;
    this.createdAt = createdAt ?? null;
  }

  static create({ postId, userId, type }) {
    if (!postId || !userId) {
      throw new ValidationError("Both a post and a user are required to create a reaction.");
    }
    if (!TYPES.has(type)) {
      throw new ValidationError("type must be 'like' or 'clap'.", { field: "type" });
    }
    return new Reaction({ postId, userId, type });
  }

  toPublic() {
    return { id: this.id, postId: this.postId, userId: this.userId, type: this.type, createdAt: this.createdAt };
  }
}

module.exports = Reaction;
