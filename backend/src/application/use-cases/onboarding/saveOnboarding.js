const OnboardingProfile = require("../../../domain/entities/OnboardingProfile");

/** @param {{ onboardingRepository: import("../../../domain/ports").OnboardingRepository }} deps */
function makeSaveOnboarding({ onboardingRepository }) {
  /** Create or replace the caller's onboarding profile (one per user, full overwrite). */
  return async function saveOnboarding(userId, input) {
    const profile = OnboardingProfile.create(userId, input);
    return onboardingRepository.upsert(profile);
  };
}

module.exports = makeSaveOnboarding;
