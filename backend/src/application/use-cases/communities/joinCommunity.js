const Membership = require("../../../domain/entities/Membership");
const { ConflictError, NotFoundError } = require("../../../domain/errors");

/**
 * @param {{
 *   communityRepository: import("../../../domain/ports").CommunityRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 * }} deps
 */
function makeJoinCommunity({ communityRepository, membershipRepository }) {
  return async function joinCommunity(viewerId, communityId) {
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundError("That community doesn't exist.");
    }

    // Pre-check for a clear message; the unique index is the race-safety net.
    const existing = await membershipRepository.findOne(viewerId, communityId);
    if (existing) {
      throw new ConflictError("You're already a member of this community.");
    }

    await membershipRepository.create(Membership.join(viewerId, communityId));
    await communityRepository.incrementMemberCount(communityId, 1);

    return { ...community.toPublic(), memberCount: community.memberCount + 1, isMember: true, role: "member" };
  };
}

module.exports = makeJoinCommunity;
