const test = require("node:test");
const assert = require("node:assert/strict");

const makeRemoveMember = require("../../src/application/use-cases/communities/removeMember");
const { ValidationError, NotFoundError, UnauthorizedError } = require("../../src/domain/errors");

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
    async deleteOne(userId, communityId) {
      const membership = memberships.find((m) => m.userId === userId && m.communityId === communityId);
      if (membership) membership.deleted = true;
    },
  };
}

test("removeMember lets an admin remove another member", async () => {
  const community = { id: "community-1", memberCount: 2 };
  const memberships = [
    { userId: "admin-1", communityId: "community-1", role: "admin", isAdmin: () => true },
    { userId: "user-2", communityId: "community-1", role: "member", isAdmin: () => false },
  ];
  const removeMember = makeRemoveMember({
    communityRepository: makeFakeCommunityRepository(community),
    membershipRepository: makeFakeMembershipRepository(memberships),
  });

  await removeMember("admin-1", "community-1", "user-2");

  assert.equal(community.memberCount, 1);
  assert.equal(memberships[1].deleted, true);
});

test("removeMember rejects a non-admin viewer", async () => {
  const community = { id: "community-1", memberCount: 2 };
  const memberships = [
    { userId: "user-1", communityId: "community-1", role: "member", isAdmin: () => false },
    { userId: "user-2", communityId: "community-1", role: "member", isAdmin: () => false },
  ];
  const removeMember = makeRemoveMember({
    communityRepository: makeFakeCommunityRepository(community),
    membershipRepository: makeFakeMembershipRepository(memberships),
  });

  await assert.rejects(() => removeMember("user-1", "community-1", "user-2"), UnauthorizedError);
});

test("removeMember rejects an admin removing themselves", async () => {
  const community = { id: "community-1", memberCount: 1 };
  const memberships = [{ userId: "admin-1", communityId: "community-1", role: "admin", isAdmin: () => true }];
  const removeMember = makeRemoveMember({
    communityRepository: makeFakeCommunityRepository(community),
    membershipRepository: makeFakeMembershipRepository(memberships),
  });

  await assert.rejects(() => removeMember("admin-1", "community-1", "admin-1"), ValidationError);
});

test("removeMember rejects a target who isn't a member", async () => {
  const community = { id: "community-1", memberCount: 1 };
  const memberships = [{ userId: "admin-1", communityId: "community-1", role: "admin", isAdmin: () => true }];
  const removeMember = makeRemoveMember({
    communityRepository: makeFakeCommunityRepository(community),
    membershipRepository: makeFakeMembershipRepository(memberships),
  });

  await assert.rejects(() => removeMember("admin-1", "community-1", "ghost"), NotFoundError);
});
