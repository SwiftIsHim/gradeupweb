const { ValidationError, NotFoundError } = require("../../../domain/errors");

/**
 * @param {{
 *   communityRepository: import("../../../domain/ports").CommunityRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 * }} deps
 */
function makeLeaveCommunity({ communityRepository, membershipRepository }) {
  return async function leaveCommunity(viewerId, communityId) {
    const membership = await membershipRepository.findOne(viewerId, communityId);
    if (!membership) {
      throw new NotFoundError("You're not a member of this community.");
    }

    if (membership.isAdmin()) {
      const members = await membershipRepository.listByCommunity(communityId);
      const adminCount = members.filter((m) => m.isAdmin()).length;
      if (adminCount <= 1) {
        throw new ValidationError("You're the only admin — promote another member before leaving.");
      }
    }

    await membershipRepository.deleteOne(viewerId, communityId);
    await communityRepository.incrementMemberCount(communityId, -1);
  };
}

module.exports = makeLeaveCommunity;
