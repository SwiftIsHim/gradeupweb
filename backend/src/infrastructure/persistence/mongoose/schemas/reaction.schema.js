const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "clap"], required: true },
  },
  { timestamps: true }
);

// One reaction per user per post total — switching like<->clap updates this row, not a second one.
reactionSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", reactionSchema);
