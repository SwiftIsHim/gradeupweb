const DiagnosticAttempt = require("../models/diagnosticAttempt.model");

/**
 * Diagnostic test attempts. Content is local-first on the client; this only
 * stores results, keyed by diagnosticSlug. Mirrors testAttempt.service.js.
 */

function percent(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

/** Shape one attempt document into the payload the client consumes. */
function toAttempt(doc) {
  return {
    id: String(doc._id),
    diagnosticSlug: doc.diagnosticSlug,
    score: doc.score,
    total: doc.total,
    percent: percent(doc.score, doc.total),
    durationSeconds: doc.durationSeconds ?? null,
    takenAt: doc.createdAt,
    answers: (doc.answers ?? []).map((a) => ({
      questionIndex: a.questionIndex,
      selectedKey: a.selectedKey ?? null,
      correctKey: a.correctKey,
      isCorrect: a.isCorrect,
    })),
  };
}

/** All of a user's diagnostic attempts, most recent first. */
async function listAttempts(userId) {
  const docs = await DiagnosticAttempt.find({ user: userId }).sort({ createdAt: -1 });
  return docs.map(toAttempt);
}

/** A user's attempts at one diagnostic, most recent first. */
async function listAttemptsForDiagnostic(userId, slug) {
  const docs = await DiagnosticAttempt.find({
    user: userId,
    diagnosticSlug: slug,
  }).sort({ createdAt: -1 });
  return docs.map(toAttempt);
}

/** Record a new attempt. */
async function createAttempt(userId, slug, { score, total, durationSeconds, answers }) {
  const doc = await DiagnosticAttempt.create({
    user: userId,
    diagnosticSlug: slug,
    score,
    total,
    durationSeconds: durationSeconds ?? null,
    answers: Array.isArray(answers) ? answers : [],
  });
  return toAttempt(doc);
}

module.exports = {
  listAttempts,
  listAttemptsForDiagnostic,
  createAttempt,
};
