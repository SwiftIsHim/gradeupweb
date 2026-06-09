const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    organization: { type: String, trim: true },
    // Stored as a bcrypt hash, never in plain text. Excluded from queries by default.
    passwordHash: { type: String, required: true, select: false },
    loginHint: { type: String, default: "Use password" },
  },
  { timestamps: true }
);

/** Hash and store a plain-text password. */
userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

/** Compare a plain-text password against the stored hash. */
userSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
