const mongoose = require("mongoose");

/**
 * One document per user pair. `userLow`/`userHigh` are the pair's two ids
 * sorted lexicographically (infra-only — the domain entity doesn't know
 * about them) so a single unique compound index blocks a duplicate request
 * in *either* direction, the same technique already used for the
 * `(user, courseSlug)` index on CourseProgress.
 *
 * Only two statuses are ever persisted: `pending` and `accepted`. Decline
 * and cancel delete the document instead of writing a third status, so a
 * declined/cancelled pair can freely re-request later.
 */
const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: { type: String, enum: ["pending", "accepted"], default: "pending", index: true },
    userLow: { type: mongoose.Schema.Types.ObjectId, required: true },
    userHigh: { type: mongoose.Schema.Types.ObjectId, required: true },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

friendshipSchema.index({ userLow: 1, userHigh: 1 }, { unique: true });

module.exports = mongoose.model("Friendship", friendshipSchema);
