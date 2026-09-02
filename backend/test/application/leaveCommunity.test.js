const test = require("node:test");
const assert = require("node:assert/strict");

const makeLeaveCommunity = require("../../src/application/use-cases/communities/leaveCommunity");
const { ValidationError, NotFoundError } = require("../../src/domain/errors");

function makeFakeCommunityRepository(community) {
  return {
    async incrementMemberCount(id, delta) {
      if (community && community.id === id) community.memberCount += delta;
    },
  };
}

function makeFakeMembershipRepository(memberships) {
  return {
    async findOne(userId, communityId) {
      return memberships.find((m) => m.userId === userId && m.communityId === communityId && !m.deleted) || null;
    },
    async listByCommunity(communityId) {
      return memberships.filter((m) => m.communityId === communityId && !m.deleted);
    },
    async deleteOne(userId, communityId) {
      const membership = memberships.find((m) => m.userId === userId && m.communityId === communityId);
      if (membership) membership.deleted = true;
    },
  };
}

test("leaveCommunity removes the membership and decrements memberCount", async () => {
  const community = { id: "community-1", memberCount: 2 };
  const memberships = [
    { userId: "user-1", communityId: "community-1", role: "admin", isAdmin: () => true },
    { userId: "user-2", communityId: "community-1", role: "member", isAdmin: () => false },
  ];
  const leaveCommunity = makeLeaveCommunity({
    communityRepository: makeFakeCommunityRepository(community),
    membershipRepository: makeFakeMembershipRepository(memberships),
  });

  await leaveCommunity("user-2", "community-1");

  assert.equal(community.memberCount, 1);
});

test("leaveCommunity rejects when the viewer isn't a member", async () => {
  const community = { id: "community-1", memberCount: 1 };
  const leaveCommunity = makeLeaveCommunity({
    communityRepository: makeFakeCommunityRepository(community),
    membershipRepository: makeFakeMembershipRepository([]),
  });

  await assert.rejects(() => leaveCommunity("user-1", "community-1"), NotFoundError);
});

test("leaveCommunity rejects the sole admin leaving", async () => {
  const community = { id: "community-1", memberCount: 2 };
  const memberships = [
    { userId: "user-1", communityId: "community-1", role: "admin", isAdmin: () => true },
    { userId: "user-2", communityId: "community-1", role: "member", isAdmin: () => false },
  ];
  const leaveCommunity = makeLeaveCommunity({
    communityRepository: makeFakeCommunityRepository(community),
    membershipRepository: makeFakeMembershipRepository(memberships),
  });

  await assert.rejects(() => leaveCommunity("user-1", "community-1"), ValidationError);
});

test("leaveCommunity allows an admin to leave when a co-admin remains", async () => {
  const community = { id: "community-1", memberCount: 2 };
  const memberships = [
    { userId: "user-1", communityId: "community-1", role: "admin", isAdmin: () => true },
    { userId: "user-2", communityId: "community-1", role: "admin", isAdmin: () => true },
  ];
  const leaveCommunity = makeLeaveCommunity({
    communityRepository: makeFakeCommunityRepository(community),
    membershipRepository: makeFakeMembershipRepository(memberships),
  });

  await leaveCommunity("user-1", "community-1");

  assert.equal(community.memberCount, 1);
});
