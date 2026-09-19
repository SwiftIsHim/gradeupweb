const { ValidationError } = require("../errors");

const ROLES = new Set(["member", "admin"]);

/** A user's membership in a community. Gates authorization for posting into and moderating a community. */
class Membership {
  constructor({ id, userId, communityId, role, joinedAt }) {
    this.id = id;
    this.userId = userId;
    this.communityId = communityId;
    this.role = role;
    this.joinedAt = joinedAt ?? null;
  }

  /** Build a new (not-yet-persisted) membership. Community creators join as "admin"; everyone else defaults to "member". */
  static join(userId, communityId, role = "member") {
    if (!userId || !communityId) {
      throw new ValidationError("Both a user and a community are required to create a membership.");
    }
    if (!ROLES.has(role)) {
      throw new ValidationError("role must be 'member' or 'admin'.", { field: "role" });
    }
    return new Membership({ userId, communityId, role });
  }

  isAdmin() {
    return this.role === "admin";
  }

  toPublic() {
    return {
      id: this.id,
      userId: this.userId,
      communityId: this.communityId,
      role: this.role,
      joinedAt: this.joinedAt,
    };
  }
}

module.exports = Membership;
