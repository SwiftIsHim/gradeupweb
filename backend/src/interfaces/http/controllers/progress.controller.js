const asyncHandler = require("../asyncHandler");
const { ValidationError } = require("../../../domain/errors");

function chapterParam(req) {
  const chapterNumber = Number(req.params.chapter);
  if (!Number.isInteger(chapterNumber) || chapterNumber <= 0) {
    throw new ValidationError("Invalid chapter number.");
  }
  return chapterNumber;
}

function makeProgressController({ listProgress, getCourseProgress, markChapterComplete, saveQuizResult }) {
  // GET /progress -> { progress: [...] }
  const list = asyncHandler(async (req, res) => {
    const progress = await listProgress(req.user.id);
    res.json({ progress: progress.map((p) => p.toPublic()) });
  });

  // GET /progress/:slug -> { progress }
  const detail = asyncHandler(async (req, res) => {
    const progress = await getCourseProgress(req.user.id, req.params.slug);
    res.json({ progress: progress.toPublic() });
  });

  // POST /progress/:slug/chapters/:chapter/complete -> { progress }
  const complete = asyncHandler(async (req, res) => {
    const progress = await markChapterComplete(req.user.id, req.params.slug, chapterParam(req));
    res.json({ progress: progress.toPublic() });
  });

  // POST /progress/:slug/chapters/:chapter/quiz -> { progress }
  const submitQuiz = asyncHandler(async (req, res) => {
    const { score, total } = req.body;
    const progress = await saveQuizResult(req.user.id, req.params.slug, chapterParam(req), score, total);
    res.json({ progress: progress.toPublic() });
  });

  return { list, detail, complete, submitQuiz };
}

module.exports = makeProgressController;
