const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const progressService = require("../services/progress.service");

/** Parse and validate a :chapter route param into a positive integer. */
function chapterParam(req) {
  const n = Number(req.params.chapter);
  if (!Number.isInteger(n) || n < 1) {
    throw ApiError.badRequest("Invalid chapter number.");
  }
  return n;
}

// GET /progress
const list = asyncHandler(async (req, res) => {
  const progress = await progressService.listProgress(req.user.id);
  res.json({ progress });
});

// GET /progress/:slug
const detail = asyncHandler(async (req, res) => {
  const progress = await progressService.getCourseProgress(
    req.user.id,
    req.params.slug
  );
  res.json({ progress });
});

// POST /progress/:slug/chapters/:chapter/complete
const complete = asyncHandler(async (req, res) => {
  const progress = await progressService.markChapterComplete(
    req.user.id,
    req.params.slug,
    chapterParam(req)
  );
  res.json({ progress });
});

// POST /progress/:slug/chapters/:chapter/quiz  → { score, total }
const submitQuiz = asyncHandler(async (req, res) => {
  const score = Number(req.body?.score);
  const total = Number(req.body?.total);
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1) {
    throw ApiError.badRequest("A valid score and total are required.");
  }
  if (score < 0 || score > total) {
    throw ApiError.badRequest("Score must be between 0 and total.");
  }
  const progress = await progressService.saveQuizResult(
    req.user.id,
    req.params.slug,
    chapterParam(req),
    score,
    total
  );
  res.json({ progress });
});

module.exports = {
  list,
  detail,
  complete,
  submitQuiz,
};
