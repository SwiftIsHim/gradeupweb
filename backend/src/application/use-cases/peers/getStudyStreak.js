const { computeStreakDays } = require("../../../domain/services/studyStreak");

/**
 * @param {{
 *   progressRepository: import("../../../domain/ports").ProgressRepository,
 *   testAttemptRepository: import("../../../domain/ports").AttemptRepository,
 *   diagnosticAttemptRepository: import("../../../domain/ports").AttemptRepository,
 * }} deps
 */
function makeGetStudyStreak({ progressRepository, testAttemptRepository, diagnosticAttemptRepository }) {
  return async function getStudyStreak(userId) {
    const [progress, testAttempts, diagnosticAttempts] = await Promise.all([
      progressRepository.listByUser(userId),
      testAttemptRepository.listByUser(userId),
      diagnosticAttemptRepository.listByUser(userId),
    ]);

    const activityDates = [
      ...testAttempts.map((a) => a.takenAt),
      ...diagnosticAttempts.map((a) => a.takenAt),
      ...progress.flatMap((p) => p.quizResults.map((r) => r.takenAt)),
    ];

    return computeStreakDays(activityDates);
  };
}

module.exports = makeGetStudyStreak;
