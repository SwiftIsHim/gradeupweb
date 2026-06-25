const mongoose = require("mongoose");

/**
 * One recorded attempt at a test. Tests themselves (the question content) live
 * in the local JSON and are seeded into WatermelonDB on the client; only the
 * user's attempts are persisted here, keyed by the test slug. Many attempts
 * per (user, test) are allowed — each retake is its own document.
 */
const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedKey: { type: String, default: null },
    correctKey: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    testSlug: { type: String, required: true, trim: true, index: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    durationSeconds: { type: Number, default: null },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true }
);

testAttemptSchema.index({ user: 1, testSlug: 1, createdAt: -1 });

module.exports = mongoose.model("TestAttempt", testAttemptSchema);
