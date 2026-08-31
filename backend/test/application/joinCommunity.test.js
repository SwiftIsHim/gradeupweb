const test = require("node:test");
const assert = require("node:assert/strict");

const makeJoinCommunity = require("../../src/application/use-cases/communities/joinCommunity");
const { ConflictError, NotFoundError } = require("../../src/domain/errors");

function makeFakeCommunityRepository(communities) {
  return {
    // Real repo's findById (via Mongoose .lean()) returns a fresh snapshot
    // each call, decoupled from later incrementMemberCount writes — copy here too.
    async findById(id) {
      const community = communities.get(id);
      return community ? { ...community } : null;
    },
    async incrementMemberCount(id, delta) {
      const community = communities.get(id);
      if (community) community.memberCount += delta;
    },
  };
}

function makeFakeMembershipRepository() {
  const byKey = new Map();
  const key = (userId, communityId) => `${userId}:${communityId}`;
  return {
    async findOne(userId, communityId) {
      return byKey.get(key(userId, communityId)) || null;
    },
    async create(membership) {
      byKey.set(key(membership.userId, membership.communityId), membership);
      return membership;
    },
  };
}

test("joinCommunity creates a membership and increments memberCount", async () => {
  const communities = new Map([["community-1", { id: "community-1", name: "JAMB Physics", memberCount: 3, toPublic() { return this; } }]]);
  const communityRepository = makeFakeCommunityRepository(communities);
  const membershipRepository = makeFakeMembershipRepository();
  const joinCommunity = makeJoinCommunity({ communityRepository, membershipRepository });

  const result = await joinCommunity("user-1", "community-1");

  assert.equal(result.memberCount, 4);
  assert.equal(result.isMember, true);
  assert.equal(await membershipRepository.findOne("user-1", "community-1") ? true : false, true);
});

test("joinCommunity rejects a community that doesn't exist", async () => {
  const communityRepository = makeFakeCommunityRepository(new Map());
  const membershipRepository = makeFakeMembershipRepository();
  const joinCommunity = makeJoinCommunity({ communityRepository, membershipRepository });

  await assert.rejects(() => joinCommunity("user-1", "ghost"), NotFoundError);
});

test("joinCommunity rejects a duplicate membership", async () => {
  const communities = new Map([["community-1", { id: "community-1", name: "JAMB Physics", memberCount: 3, toPublic() { return this; } }]]);
  const communityRepository = makeFakeCommunityRepository(communities);
  const membershipRepository = makeFakeMembershipRepository();
  const joinCommunity = makeJoinCommunity({ communityRepository, membershipRepository });

  await joinCommunity("user-1", "community-1");
  await assert.rejects(() => joinCommunity("user-1", "community-1"), ConflictError);
});
