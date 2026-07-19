const CourseProgress = require("../../../domain/entities/CourseProgress");

/** @param {{ progressRepository: import("../../../domain/ports").ProgressRepository }} deps */
function makeMarkChapterComplete({ progressRepository }) {
  return async function markChapterComplete(userId, slug, chapterNumber) {
    CourseProgress.assertValidChapterNumber(chapterNumber);
    // Atomic at the repository — safe under concurrent completions for the same user.
    return progressRepository.addCompletedChapter(userId, slug, chapterNumber);
  };
}

module.exports = makeMarkChapterComplete;
