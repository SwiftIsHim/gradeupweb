const { ValidationError, NotFoundError, UnauthorizedError } = require("../../../domain/errors");

/**
 * @param {{
 *   communityRepository: import("../../../domain/ports").CommunityRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 * }} deps
 */
function makeRemoveMember({ communityRepository, membershipRepository }) {
  return async function removeMember(viewerId, communityId, targetUserId) {
    const viewerMembership = await membershipRepository.findOne(viewerId, communityId);
    if (!viewerMembership || !viewerMembership.isAdmin()) {
      throw new UnauthorizedError("Only a community admin can remove members.");
    }
    if (String(viewerId) === String(targetUserId)) {
      throw new ValidationError("Use leave instead of removing yourself.");
    }

    const targetMembership = await membershipRepository.findOne(targetUserId, communityId);
    if (!targetMembership) {
      throw new NotFoundError("That user isn't a member of this community.");
    }

    await membershipRepository.deleteOne(targetUserId, communityId);
    await communityRepository.incrementMemberCount(communityId, -1);
  };
}

module.exports = makeRemoveMember;
