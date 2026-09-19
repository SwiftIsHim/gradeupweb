const Community = require("../../../domain/entities/Community");
const Membership = require("../../../domain/entities/Membership");

/**
 * @param {{
 *   communityRepository: import("../../../domain/ports").CommunityRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 * }} deps
 */
function makeCreateCommunity({ communityRepository, membershipRepository }) {
  return async function createCommunity(viewerId, { name, description, examTag, subjects }) {
    const community = await communityRepository.create(
      Community.create({ name, description, examTag, subjects, createdBy: viewerId })
    );
    await membershipRepository.create(Membership.join(viewerId, community.id, "admin"));
    await communityRepository.incrementMemberCount(community.id, 1);

    return { ...community.toPublic(), memberCount: 1, isMember: true, role: "admin" };
  };
}

module.exports = makeCreateCommunity;
