const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: null },
    type: { type: String, enum: ["score", "learning", "quizShare", "examShare"], required: true },
    caption: { type: String, default: "", trim: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: null },
    reactionCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
