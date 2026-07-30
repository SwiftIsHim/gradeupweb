const CourseProgress = require("../../../domain/entities/CourseProgress");

/** @param {{ progressRepository: import("../../../domain/ports").ProgressRepository }} deps */
function makeSaveQuizResult({ progressRepository }) {
  return async function saveQuizResult(userId, slug, chapterNumber, score, total) {
    CourseProgress.assertValidChapterNumber(chapterNumber);
    CourseProgress.assertValidQuizResult(score, total);
    // Atomic at the repository — safe under concurrent submissions for the same user.
    return progressRepository.upsertQuizResult(userId, slug, chapterNumber, score, total);
  };
}

module.exports = makeSaveQuizResult;
