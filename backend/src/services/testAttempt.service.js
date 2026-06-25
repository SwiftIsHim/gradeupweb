const TestAttempt = require("../models/testAttempt.model");

/**
 * Test attempts. Content (questions) is local-first on the client; this only
 * stores results, keyed by the test slug, so the client can show past attempts
 * and aggregate stats. Percentages are derived here for convenience.
 */

function percent(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

/** Shape one attempt document into the payload the client consumes. */
function toAttempt(doc) {
  return {
    id: String(doc._id),
    testSlug: doc.testSlug,
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

/** All of a user's attempts, most recent first. */
async function listAttempts(userId) {
  const docs = await TestAttempt.find({ user: userId }).sort({ createdAt: -1 });
  return docs.map(toAttempt);
}

/** A user's attempts at one test, most recent first. */
async function listAttemptsForTest(userId, slug) {
  const docs = await TestAttempt.find({
    user: userId,
    testSlug: slug,
  }).sort({ createdAt: -1 });
  return docs.map(toAttempt);
}

/** Record a new attempt. */
async function createAttempt(userId, slug, { score, total, durationSeconds, answers }) {
  const doc = await TestAttempt.create({
    user: userId,
    testSlug: slug,
    score,
    total,
    durationSeconds: durationSeconds ?? null,
    answers: Array.isArray(answers) ? answers : [],
  });
  return toAttempt(doc);
}

module.exports = {
  listAttempts,
  listAttemptsForTest,
  createAttempt,
};
