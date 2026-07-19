const test = require("node:test");
const assert = require("node:assert/strict");

const CourseProgress = require("../../src/domain/entities/CourseProgress");
const { ValidationError } = require("../../src/domain/errors");

test("addCompletedChapter keeps chaptersCompleted sorted and de-duplicated", () => {
  const progress = CourseProgress.empty("user-1", "algebra-1");
  progress.addCompletedChapter(3);
  progress.addCompletedChapter(1);
  progress.addCompletedChapter(3); // idempotent

  assert.deepEqual(progress.chaptersCompleted, [1, 3]);
  assert.equal(progress.lastChapterNumber, 3);
});

test("addCompletedChapter rejects non-positive-integer chapter numbers", () => {
  const progress = CourseProgress.empty("user-1", "algebra-1");
  assert.throws(() => progress.addCompletedChapter(0), ValidationError);
  assert.throws(() => progress.addCompletedChapter(1.5), ValidationError);
});

test("upsertQuizResult replaces the prior result for the same chapter", () => {
  const progress = CourseProgress.empty("user-1", "algebra-1");
  progress.upsertQuizResult(2, 3, 5);
  progress.upsertQuizResult(2, 5, 5); // retake

  assert.equal(progress.quizResults.length, 1);
  assert.equal(progress.quizResults[0].score, 5);
});

test("upsertQuizResult rejects an out-of-range score", () => {
  const progress = CourseProgress.empty("user-1", "algebra-1");
  assert.throws(() => progress.upsertQuizResult(1, 6, 5), ValidationError);
});
