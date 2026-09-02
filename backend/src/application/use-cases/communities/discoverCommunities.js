/**
 * @param {{
 *   communityRepository: import("../../../domain/ports").CommunityRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 * }} deps
 */
function makeDiscoverCommunities({ communityRepository, membershipRepository }) {
  return async function discoverCommunities(viewerId, query) {
    const [communities, memberships] = await Promise.all([
      communityRepository.search({ q: query }),
      membershipRepository.listByUser(viewerId),
    ]);

    const membershipByCommunityId = new Map(memberships.map((m) => [String(m.communityId), m]));

    return communities.map((community) => {
      const membership = membershipByCommunityId.get(String(community.id));
      return {
        ...community.toPublic(),
        isMember: Boolean(membership),
        role: membership?.role ?? null,
      };
    });
  };
}

module.exports = makeDiscoverCommunities;
