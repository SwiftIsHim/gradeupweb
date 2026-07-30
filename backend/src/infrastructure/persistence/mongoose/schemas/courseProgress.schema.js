const mongoose = require("mongoose");

/**
 * A user's progress through one course: which chapters they've finished reading
 * and their quiz results per chapter. One document per (user, courseSlug);
 * upserted as the user reads chapters and takes assessments.
 *
 * Course content itself no longer lives in MongoDB — it is loaded from the
 * local JSON files into WatermelonDB on the client. A course is therefore
 * referenced here only by its `courseSlug` (the same slug the client derives
 * from the JSON), not by a Course document id.
 */
const quizResultSchema = new mongoose.Schema(
  {
    chapterNumber: { type: Number, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    takenAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const courseProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Slug of the course this progress belongs to (matches the client's JSON).
    courseSlug: { type: String, required: true, trim: true, index: true },
    // Chapter numbers the user has marked complete (kept sorted, unique).
    chaptersCompleted: { type: [Number], default: [] },
    // Latest quiz result per chapter (one entry per chapter, overwritten on retake).
    quizResults: { type: [quizResultSchema], default: [] },
    lastChapterNumber: { type: Number, default: null },
  },
  { timestamps: true }
);

courseProgressSchema.index({ user: 1, courseSlug: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
