const OnboardingProfile = require("../models/onboardingProfile.model");

/**
 * Create or replace the onboarding profile for a user. Upsert keyed on `user`
 * so finishing onboarding again overwrites the previous answers in place.
 */
async function saveOnboarding(userId, input) {
  const profile = await OnboardingProfile.findOneAndUpdate(
    { user: userId },
    { ...input, user: userId, completedAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return profile;
}

/** Fetch a user's onboarding profile, or null if they haven't onboarded. */
async function getOnboarding(userId) {
  return OnboardingProfile.findOne({ user: userId });
}

module.exports = { saveOnboarding, getOnboarding };
