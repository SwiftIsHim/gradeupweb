/**
 * @param {{
 *   communityRepository: import("../../../domain/ports").CommunityRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 * }} deps
 */
function makeListMyCommunities({ communityRepository, membershipRepository }) {
  return async function listMyCommunities(viewerId) {
    const memberships = await membershipRepository.listByUser(viewerId);
    if (!memberships.length) return [];

    const communityIds = memberships.map((m) => m.communityId);
    const communities = await communityRepository.listByIds(communityIds);
    const roleByCommunityId = new Map(memberships.map((m) => [String(m.communityId), m.role]));

    return communities
      .map((community) => ({
        ...community.toPublic(),
        isMember: true,
        role: roleByCommunityId.get(String(community.id)) ?? "member",
      }))
      .filter(Boolean);
  };
}

module.exports = makeListMyCommunities;
