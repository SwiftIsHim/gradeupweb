const asyncHandler = require("../asyncHandler");

function makeOnboardingController({ saveOnboarding, getOnboarding }) {
  // POST /onboarding -> { profile }
  const save = asyncHandler(async (req, res) => {
    const profile = await saveOnboarding(req.user.id, req.body);
    res.json({ profile: profile.toPublic() });
  });

  // GET /onboarding -> { profile: profile|null }
  const get = asyncHandler(async (req, res) => {
    const profile = await getOnboarding(req.user.id);
    res.json({ profile: profile ? profile.toPublic() : null });
  });

  return { save, get };
}

module.exports = makeOnboardingController;
