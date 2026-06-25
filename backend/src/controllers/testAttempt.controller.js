const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const service = require("../services/testAttempt.service");

const VALID_KEYS = new Set(["A", "B", "C", "D"]);

/** Validate and normalize an optional per-question answers array. */
function normalizeAnswers(raw, total) {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) {
    throw ApiError.badRequest("Answers must be an array.");
  }
  return raw.map((a) => {
    const questionIndex = Number(a?.questionIndex);
    if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= total) {
      throw ApiError.badRequest("Invalid question index in answers.");
    }
    const correctKey = String(a?.correctKey ?? "");
    if (!VALID_KEYS.has(correctKey)) {
      throw ApiError.badRequest("Invalid correct key in answers.");
    }
    const selectedRaw = a?.selectedKey;
    const selectedKey =
      selectedRaw === null || selectedRaw === undefined
        ? null
        : String(selectedRaw);
    if (selectedKey !== null && !VALID_KEYS.has(selectedKey)) {
      throw ApiError.badRequest("Invalid selected key in answers.");
    }
    return {
      questionIndex,
      selectedKey,
      correctKey,
      isCorrect: selectedKey === correctKey,
    };
  });
}

// GET /test-attempts
const list = asyncHandler(async (req, res) => {
  const attempts = await service.listAttempts(req.user.id);
  res.json({ attempts });
});

// GET /test-attempts/:slug
const listForTest = asyncHandler(async (req, res) => {
  const attempts = await service.listAttemptsForTest(req.user.id, req.params.slug);
  res.json({ attempts });
});

// POST /test-attempts/:slug  → { score, total, durationSeconds?, answers? }
const create = asyncHandler(async (req, res) => {
  const score = Number(req.body?.score);
  const total = Number(req.body?.total);
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1) {
    throw ApiError.badRequest("A valid score and total are required.");
  }
  if (score < 0 || score > total) {
    throw ApiError.badRequest("Score must be between 0 and total.");
  }

  const durationRaw = req.body?.durationSeconds;
  let durationSeconds = null;
  if (durationRaw !== undefined && durationRaw !== null) {
    durationSeconds = Number(durationRaw);
    if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
      throw ApiError.badRequest("Invalid duration.");
    }
  }

  const answers = normalizeAnswers(req.body?.answers, total);

  const attempt = await service.createAttempt(req.user.id, req.params.slug, {
    score,
    total,
    durationSeconds,
    answers,
  });
  res.status(201).json({ attempt });
});

module.exports = {
  list,
  listForTest,
  create,
};
