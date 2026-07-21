const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);
