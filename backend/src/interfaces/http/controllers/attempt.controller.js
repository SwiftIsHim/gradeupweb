const asyncHandler = require("../asyncHandler");

/** Shared by /test-attempts and /diagnostic-attempts — the use cases already know their kind. */
function makeAttemptController({ recordAttempt, listAttempts, listAttemptsForSlug }) {
  const list = asyncHandler(async (req, res) => {
    const attempts = await listAttempts(req.user.id);
    res.json({ attempts: attempts.map((a) => a.toPublic()) });
  });

  const listForSlug = asyncHandler(async (req, res) => {
    const attempts = await listAttemptsForSlug(req.user.id, req.params.slug);
    res.json({ attempts: attempts.map((a) => a.toPublic()) });
  });

  const create = asyncHandler(async (req, res) => {
    const attempt = await recordAttempt(req.user.id, req.params.slug, req.body);
    res.status(201).json({ attempt: attempt.toPublic() });
  });

  return { list, listForSlug, create };
}

module.exports = makeAttemptController;
