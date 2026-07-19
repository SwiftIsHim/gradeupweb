const { ValidationError } = require("../errors");

/**
 * Per-user, per-course progress. Course *content* lives client-side (local
 * JSON -> WatermelonDB); this only tracks which chapters are done and quiz
 * results, keyed by courseSlug — there is no backing Course aggregate.
 */
class CourseProgress {
  constructor({ id, userId, courseSlug, chaptersCompleted, quizResults, lastChapterNumber }) {
    this.id = id;
    this.userId = userId;
    this.courseSlug = courseSlug;
    this.chaptersCompleted = [...(chaptersCompleted ?? [])].sort((a, b) => a - b);
    this.quizResults = quizResults ?? [];
    this.lastChapterNumber = lastChapterNumber ?? null;
  }

  static empty(userId, courseSlug) {
    return new CourseProgress({ userId, courseSlug, chaptersCompleted: [], quizResults: [], lastChapterNumber: null });
  }

  /**
   * Validation only — the repository applies the actual update atomically
   * ($addToSet / $pull+$push) so two concurrent requests for the same user
   * never lose one write to the other. Use these to validate use-case input
   * before it reaches persistence, and the instance methods below when
   * working with an in-memory entity (e.g. unit tests).
   */
  static assertValidChapterNumber(chapterNumber) {
    assertPositiveInteger(chapterNumber);
  }

  static assertValidQuizResult(score, total) {
    if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) {
      throw new ValidationError("score and total must be integers with 0 <= score <= total.");
    }
  }

  /** Mark a chapter complete (idempotent), keeping chaptersCompleted sorted + unique. */
  addCompletedChapter(chapterNumber) {
    CourseProgress.assertValidChapterNumber(chapterNumber);
    if (!this.chaptersCompleted.includes(chapterNumber)) {
      this.chaptersCompleted = [...this.chaptersCompleted, chapterNumber].sort((a, b) => a - b);
    }
    this.lastChapterNumber = chapterNumber;
  }

  /** Latest quiz result per chapter — replaces any prior result for that chapter. */
  upsertQuizResult(chapterNumber, score, total) {
    CourseProgress.assertValidChapterNumber(chapterNumber);
    CourseProgress.assertValidQuizResult(score, total);
    this.quizResults = [
      ...this.quizResults.filter((r) => r.chapterNumber !== chapterNumber),
      { chapterNumber, score, total, takenAt: new Date() },
    ];
  }

  toPublic() {
    return {
      courseSlug: this.courseSlug,
      chaptersCompleted: this.chaptersCompleted,
      lastChapterNumber: this.lastChapterNumber,
      quizResults: this.quizResults.map((r) => ({
        chapterNumber: r.chapterNumber,
        score: r.score,
        total: r.total,
        takenAt: r.takenAt,
      })),
    };
  }
}

function assertPositiveInteger(value) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError("Invalid chapter number.");
  }
}

module.exports = CourseProgress;
