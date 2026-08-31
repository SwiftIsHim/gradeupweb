const MembershipModel = require("../schemas/membership.schema");
const Membership = require("../../../../domain/entities/Membership");
const { ConflictError } = require("../../../../domain/errors");

function toEntity(doc) {
  if (!doc) return null;
  return new Membership({
    id: doc._id ? String(doc._id) : undefined,
    userId: doc.user ? String(doc.user) : undefined,
    communityId: doc.community ? String(doc.community) : undefined,
    role: doc.role,
    joinedAt: doc.createdAt,
  });
}

/** @implements {import("../../../../domain/ports").MembershipRepository} */
const mongoMembershipRepository = {
  async create(membership) {
    try {
      const doc = await MembershipModel.create({
        user: membership.userId,
        community: membership.communityId,
        role: membership.role,
      });
      return toEntity(doc);
    } catch (err) {
      if (err && err.code === 11000) {
        throw new ConflictError("You're already a member of this community.");
      }
      throw err;
    }
  },

  async findOne(userId, communityId) {
    const doc = await MembershipModel.findOne({ user: userId, community: communityId }).lean();
    return toEntity(doc);
  },

  async deleteOne(userId, communityId) {
    await MembershipModel.deleteOne({ user: userId, community: communityId });
  },

  async listByUser(userId) {
    const docs = await MembershipModel.find({ user: userId }).lean();
    return docs.map(toEntity);
  },

  async listByCommunity(communityId) {
    const docs = await MembershipModel.find({ community: communityId }).lean();
    return docs.map(toEntity);
  },
};

module.exports = mongoMembershipRepository;
