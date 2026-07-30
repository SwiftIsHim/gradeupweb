/** @param {{ onboardingRepository: import("../../../domain/ports").OnboardingRepository }} deps */
function makeGetOnboarding({ onboardingRepository }) {
  return async function getOnboarding(userId) {
    return onboardingRepository.findByUserId(userId);
  };
}

module.exports = makeGetOnboarding;
