const CourseProgress = require("../../../domain/entities/CourseProgress");

/** @param {{ progressRepository: import("../../../domain/ports").ProgressRepository }} deps */
function makeGetCourseProgress({ progressRepository }) {
  /** One course's progress for a user, or an empty summary if untouched. */
  return async function getCourseProgress(userId, slug) {
    const progress = await progressRepository.findOne(userId, slug);
    return progress || CourseProgress.empty(userId, slug);
  };
}

module.exports = makeGetCourseProgress;
