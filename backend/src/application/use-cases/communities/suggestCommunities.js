/**
 * @param {{
 *   communityRepository: import("../../../domain/ports").CommunityRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 *   onboardingRepository: import("../../../domain/ports").OnboardingRepository,
 * }} deps
 */
function makeSuggestCommunities({ communityRepository, membershipRepository, onboardingRepository }) {
  return async function suggestCommunities(viewerId) {
    const [memberships, profile] = await Promise.all([
      membershipRepository.listByUser(viewerId),
      onboardingRepository.findByUserId(viewerId),
    ]);

    const excludeIds = memberships.map((m) => m.communityId);
    const subjects = profile?.subjects ?? [];

    const communities = await communityRepository.findRecommended({
      subjects,
      examTag: null,
      excludeIds,
      limit: 10,
    });

    return communities.map((community) => ({ ...community.toPublic(), isMember: false, role: null }));
  };
}

module.exports = makeSuggestCommunities;
