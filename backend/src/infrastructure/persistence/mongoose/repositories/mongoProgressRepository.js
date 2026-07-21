const CourseProgressModel = require("../schemas/courseProgress.schema");
const CourseProgress = require("../../../../domain/entities/CourseProgress");

function toEntity(doc) {
  if (!doc) return null;
  return new CourseProgress({
    id: doc._id ? String(doc._id) : undefined,
    userId: doc.user ? String(doc.user) : undefined,
    courseSlug: doc.courseSlug,
    chaptersCompleted: doc.chaptersCompleted,
    quizResults: doc.quizResults,
    lastChapterNumber: doc.lastChapterNumber,
  });
}

/** @implements {import("../../../../domain/ports").ProgressRepository} */
const mongoProgressRepository = {
  async listByUser(userId) {
    const docs = await CourseProgressModel.find({ user: userId }).lean();
    return docs.map(toEntity);
  },

  async findOne(userId, courseSlug) {
    const doc = await CourseProgressModel.findOne({ user: userId, courseSlug }).lean();
    return toEntity(doc);
  },

  async addCompletedChapter(userId, courseSlug, chapterNumber) {
    const doc = await CourseProgressModel.findOneAndUpdate(
      { user: userId, courseSlug },
      {
        $addToSet: { chaptersCompleted: chapterNumber },
        $set: { lastChapterNumber: chapterNumber },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return toEntity(doc);
  },

  async upsertQuizResult(userId, courseSlug, chapterNumber, score, total) {
    // Remove any existing result for this chapter, then push the new one.
    await CourseProgressModel.updateOne(
      { user: userId, courseSlug },
      { $pull: { quizResults: { chapterNumber } } },
      { upsert: true }
    );
    const doc = await CourseProgressModel.findOneAndUpdate(
      { user: userId, courseSlug },
      {
        $push: {
          quizResults: { chapterNumber, score, total, takenAt: new Date() },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return toEntity(doc);
  },
};

module.exports = mongoProgressRepository;
