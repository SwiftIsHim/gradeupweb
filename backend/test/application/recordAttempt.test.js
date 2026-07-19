const test = require("node:test");
const assert = require("node:assert/strict");

const makeRecordAttempt = require("../../src/application/use-cases/attempts/recordAttempt");
const { ValidationError } = require("../../src/domain/errors");

function makeFakeAttemptRepository(kind) {
  return {
    kind,
    saved: [],
    async create(attempt) {
      this.saved.push(attempt);
      return attempt;
    },
  };
}

test("recordAttempt normalizes answers and computes percent", async () => {
  const attemptRepository = makeFakeAttemptRepository("test");
  const recordAttempt = makeRecordAttempt({ attemptRepository });

  const attempt = await recordAttempt("user-1", "algebra-quiz-1", {
    score: 2,
    total: 4,
    answers: [
      { questionIndex: 0, correctKey: "A", selectedKey: "A" },
      { questionIndex: 1, correctKey: "B", selectedKey: "C" },
    ],
  });

  assert.equal(attempt.percent, 50);
  assert.equal(attempt.answers[0].isCorrect, true);
  assert.equal(attempt.answers[1].isCorrect, false);
  assert.equal(attempt.toPublic().testSlug, "algebra-quiz-1");
});

test("recordAttempt rejects score greater than total", async () => {
  const attemptRepository = makeFakeAttemptRepository("diagnostic");
  const recordAttempt = makeRecordAttempt({ attemptRepository });

  await assert.rejects(
    () => recordAttempt("user-1", "diag-1", { score: 5, total: 4 }),
    ValidationError
  );
});

test("recordAttempt rejects an invalid answer key", async () => {
  const attemptRepository = makeFakeAttemptRepository("test");
  const recordAttempt = makeRecordAttempt({ attemptRepository });

  await assert.rejects(
    () =>
      recordAttempt("user-1", "algebra-quiz-1", {
        score: 1,
        total: 1,
        answers: [{ questionIndex: 0, correctKey: "Z", selectedKey: "A" }],
      }),
    ValidationError
  );
});
