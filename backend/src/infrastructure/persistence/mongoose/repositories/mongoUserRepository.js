const UserModel = require("../schemas/user.schema");
const User = require("../../../../domain/entities/User");
const { ConflictError } = require("../../../../domain/errors");

function toEntity(doc, { withPasswordHash = false, withResetToken = false } = {}) {
  if (!doc) return null;
  return new User({
    id: doc._id ? String(doc._id) : undefined,
    email: doc.email,
    phone: doc.phone,
    name: doc.name,
    organization: doc.organization,
    loginHint: doc.loginHint,
    passwordHash: withPasswordHash ? doc.passwordHash : undefined,
    passwordResetTokenHash: withResetToken ? doc.passwordResetTokenHash : undefined,
    passwordResetTokenExpiresAt: withResetToken ? doc.passwordResetTokenExpiresAt : undefined,
  });
}

/** @implements {import("../../../../domain/ports").UserRepository} */
const mongoUserRepository = {
  async findByEmail(email) {
    const doc = await UserModel.findOne({ email }).lean();
    return toEntity(doc);
  },

  async findByEmailWithPasswordHash(email) {
    // passwordHash is select:false on the schema, so request it explicitly.
    const doc = await UserModel.findOne({ email }).select("+passwordHash").lean();
    return toEntity(doc, { withPasswordHash: true });
  },

  async create(user) {
    try {
      const doc = await UserModel.create({
        email: user.email,
        phone: user.phone,
        name: user.name,
        organization: user.organization,
        passwordHash: user.passwordHash,
        loginHint: user.loginHint,
      });
      return toEntity(doc);
    } catch (err) {
      // Unique index race: another request created the same email concurrently.
      if (err && err.code === 11000) {
        throw new ConflictError("An account with this email already exists.");
      }
      throw err;
    }
  },

  async findByResetTokenHash(tokenHash) {
    // Both reset-token fields are select:false on the schema, so request them explicitly.
    const doc = await UserModel.findOne({ passwordResetTokenHash: tokenHash })
      .select("+passwordResetTokenHash +passwordResetTokenExpiresAt")
      .lean();
    return toEntity(doc, { withResetToken: true });
  },

  async setResetToken(userId, tokenHash, expiresAt) {
    await UserModel.updateOne(
      { _id: userId },
      { passwordResetTokenHash: tokenHash, passwordResetTokenExpiresAt: expiresAt }
    );
  },

  async updatePassword(userId, passwordHash) {
    // Single-use: clear the reset token on successful reset.
    const doc = await UserModel.findOneAndUpdate(
      { _id: userId },
      { passwordHash, passwordResetTokenHash: null, passwordResetTokenExpiresAt: null },
      { new: true }
    ).lean();
    return toEntity(doc);
  },
};

module.exports = mongoUserRepository;
