const mongoose = require("mongoose");

/**
 * One recorded attempt at the diagnostic test. Question content lives in the
 * local JSON (frontend/Diagnostics_Test) and is not persisted here — only the
 * user's attempts, keyed by diagnosticSlug. Mirrors testAttempt.model.js.
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

const diagnosticAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    diagnosticSlug: { type: String, required: true, trim: true, index: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    durationSeconds: { type: Number, default: null },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true }
);

diagnosticAttemptSchema.index({ user: 1, diagnosticSlug: 1, createdAt: -1 });

module.exports = mongoose.model("DiagnosticAttempt", diagnosticAttemptSchema);
