const CourseProgress = require("../models/courseProgress.model");

/**
 * Per-user course progress.
 *
 * Course *content* (chapters, questions, key terms) now lives in the local
 * JSON files and is loaded into WatermelonDB on the client; the backend only
 * persists each user's progress, keyed by the course slug. Percentages and
 * "completed" flags are derived on the client by merging this progress with
 * the content's chapter count — so these endpoints return raw progress and do
 * not validate the slug against any stored course.
 */

/** Shape one progress document into the plain payload the client consumes. */
function toProgress(doc) {
  return {
    courseSlug: doc.courseSlug,
    chaptersCompleted: [...(doc.chaptersCompleted ?? [])].sort((a, b) => a - b),
    lastChapterNumber: doc.lastChapterNumber ?? null,
    quizResults: (doc.quizResults ?? []).map((r) => ({
      chapterNumber: r.chapterNumber,
      score: r.score,
      total: r.total,
      takenAt: r.takenAt,
    })),
  };
}

/** All of a user's per-course progress (one entry per course they've touched). */
async function listProgress(userId) {
  const docs = await CourseProgress.find({ user: userId });
  return docs.map(toProgress);
}

/** One course's progress for a user, or an empty summary if untouched. */
async function getCourseProgress(userId, slug) {
  const doc = await CourseProgress.findOne({ user: userId, courseSlug: slug });
  if (!doc) {
    return {
      courseSlug: slug,
      chaptersCompleted: [],
      lastChapterNumber: null,
      quizResults: [],
    };
  }
  return toProgress(doc);
}

/** Mark a chapter complete (idempotent). Returns the updated progress. */
async function markChapterComplete(userId, slug, chapterNumber) {
  const doc = await CourseProgress.findOneAndUpdate(
    { user: userId, courseSlug: slug },
    {
      $addToSet: { chaptersCompleted: chapterNumber },
      $set: { lastChapterNumber: chapterNumber },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return toProgress(doc);
}

/** Persist a quiz result for a chapter (latest result replaces prior). */
async function saveQuizResult(userId, slug, chapterNumber, score, total) {
  // Remove any existing result for this chapter, then push the new one.
  await CourseProgress.updateOne(
    { user: userId, courseSlug: slug },
    { $pull: { quizResults: { chapterNumber } } },
    { upsert: true }
  );
  const doc = await CourseProgress.findOneAndUpdate(
    { user: userId, courseSlug: slug },
    {
      $push: {
        quizResults: { chapterNumber, score, total, takenAt: new Date() },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return toProgress(doc);
}

module.exports = {
  listProgress,
  getCourseProgress,
  markChapterComplete,
  saveQuizResult,
};
