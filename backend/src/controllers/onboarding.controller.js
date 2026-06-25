const asyncHandler = require("../utils/asyncHandler");
const validators = require("../validators/onboarding.validators");
const onboardingService = require("../services/onboarding.service");

function publicProfile(profile) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    goal: profile.goal,
    gradeLevel: profile.gradeLevel,
    subjects: profile.subjects,
    examDateMode: profile.examDateMode,
    examDate: profile.examDate,
    dailyMinutes: profile.dailyMinutes,
    schedule: profile.schedule,
    notifications: profile.notifications,
    completedAt: profile.completedAt,
  };
}

// POST /onboarding  → { profile }   (requires auth)
const save = asyncHandler(async (req, res) => {
  const input = validators.validateSaveOnboarding(req.body);
  const profile = await onboardingService.saveOnboarding(req.user.id, input);
  res.json({ profile: publicProfile(profile) });
});

// GET /onboarding  → { profile | null }   (requires auth)
const get = asyncHandler(async (req, res) => {
  const profile = await onboardingService.getOnboarding(req.user.id);
  res.json({ profile: profile ? publicProfile(profile) : null });
});

module.exports = { save, get };
