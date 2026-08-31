const CommunityModel = require("../schemas/community.schema");
const Community = require("../../../../domain/entities/Community");

function toEntity(doc) {
  if (!doc) return null;
  return new Community({
    id: doc._id ? String(doc._id) : undefined,
    name: doc.name,
    description: doc.description,
    examTag: doc.examTag,
    subjects: doc.subjects,
    memberCount: doc.memberCount,
    isPublic: doc.isPublic,
    createdBy: doc.createdBy ? String(doc.createdBy) : undefined,
    createdAt: doc.createdAt,
  });
}

/** Escape a search string for safe use inside a RegExp. */
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** @implements {import("../../../../domain/ports").CommunityRepository} */
const mongoCommunityRepository = {
  async create(community) {
    const doc = await CommunityModel.create({
      name: community.name,
      description: community.description,
      examTag: community.examTag,
      subjects: community.subjects,
      memberCount: community.memberCount,
      isPublic: community.isPublic,
      createdBy: community.createdBy,
    });
    return toEntity(doc);
  },

  async findById(id) {
    const doc = await CommunityModel.findById(id).lean().catch(() => null);
    return toEntity(doc);
  },

  async listByIds(ids) {
    const docs = await CommunityModel.find({ _id: { $in: ids } }).lean();
    return docs.map(toEntity);
  },

  async search({ q, limit = 20 } = {}) {
    const escaped = escapeRegExp(String(q ?? "").trim());
    if (!escaped) {
      const docs = await CommunityModel.find({}).sort({ memberCount: -1, createdAt: -1 }).limit(limit).lean();
      return docs.map(toEntity);
    }
    const regex = new RegExp(escaped, "i");
    const docs = await CommunityModel.find({
      $or: [{ name: regex }, { description: regex }, { examTag: regex }],
    })
      .sort({ memberCount: -1 })
      .limit(limit)
      .lean();
    return docs.map(toEntity);
  },

  async findRecommended({ subjects = [], examTag = null, excludeIds = [], limit = 10 } = {}) {
    const matchers = [];
    if (subjects.length) matchers.push({ subjects: { $in: subjects } });
    if (examTag) matchers.push({ examTag });

    const filter = { _id: { $nin: excludeIds } };
    if (matchers.length) filter.$or = matchers;

    const docs = await CommunityModel.find(filter).sort({ memberCount: -1, createdAt: -1 }).limit(limit).lean();
    return docs.map(toEntity);
  },

  async incrementMemberCount(id, delta) {
    await CommunityModel.updateOne({ _id: id }, { $inc: { memberCount: delta } });
    // Defensive clamp — decrements only ever pair with a prior increment, but
    // guard against negative counts rather than trust that invariant blindly.
    await CommunityModel.updateOne({ _id: id, memberCount: { $lt: 0 } }, { memberCount: 0 });
  },
};

module.exports = mongoCommunityRepository;
