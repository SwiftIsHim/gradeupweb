const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedKey: { type: String, default: null },
    correctKey: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * One recorded attempt at a test/diagnostic. Question content lives client-side
 * (local JSON -> WatermelonDB); only the user's attempts are persisted here,
 * keyed by slug. Many attempts per (user, slug) are allowed — each retake is
 * its own document.
 *
 * `testAttempt` and `diagnosticAttempt` were previously two hand-duplicated
 * models; this factory builds both from one definition, differing only in
 * model/collection name and slug field name (`testSlug` vs `diagnosticSlug`,
 * preserved exactly so no data migration is needed).
 */
function makeAttemptModel(modelName, slugField) {
  const schema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      [slugField]: { type: String, required: true, trim: true, index: true },
      score: { type: Number, required: true },
      total: { type: Number, required: true },
      durationSeconds: { type: Number, default: null },
      answers: { type: [answerSchema], default: [] },
    },
    { timestamps: true }
  );

  schema.index({ user: 1, [slugField]: 1, createdAt: -1 });

  return mongoose.model(modelName, schema);
}

module.exports = { makeAttemptModel };
