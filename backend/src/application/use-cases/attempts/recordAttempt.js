const Attempt = require("../../../domain/entities/Attempt");

/** @param {{ attemptRepository: import("../../../domain/ports").AttemptRepository & { kind: string } }} deps */
function makeRecordAttempt({ attemptRepository }) {
  return async function recordAttempt(userId, slug, { score, total, durationSeconds, answers }) {
    const attempt = Attempt.create({
      kind: attemptRepository.kind,
      userId,
      slug,
      score,
      total,
      durationSeconds,
      answers,
    });
    return attemptRepository.create(attempt);
  };
}

module.exports = makeRecordAttempt;
