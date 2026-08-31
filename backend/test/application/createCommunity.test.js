const test = require("node:test");
const assert = require("node:assert/strict");

const makeCreateCommunity = require("../../src/application/use-cases/communities/createCommunity");
const Community = require("../../src/domain/entities/Community");

function makeFakeCommunityRepository() {
  let nextId = 1;
  const byId = new Map();
  return {
    async create(community) {
      const stored = new Community({ ...community, id: `community-${nextId++}` });
      byId.set(stored.id, stored);
      return stored;
    },
    async incrementMemberCount(id, delta) {
      const community = byId.get(id);
      if (community) community.memberCount += delta;
    },
  };
}

function makeFakeMembershipRepository() {
  const created = [];
  return {
    async create(membership) {
      const stored = { ...membership, id: `membership-${created.length + 1}` };
      created.push(stored);
      return stored;
    },
    created,
  };
}

test("createCommunity persists the community and an admin membership for the creator", async () => {
  const communityRepository = makeFakeCommunityRepository();
  const membershipRepository = makeFakeMembershipRepository();
  const createCommunity = makeCreateCommunity({ communityRepository, membershipRepository });

  const result = await createCommunity("user-1", { name: "JAMB Physics", description: "", examTag: null, subjects: [] });

  assert.equal(result.name, "JAMB Physics");
  assert.equal(result.memberCount, 1);
  assert.equal(result.isMember, true);
  assert.equal(result.role, "admin");
  assert.equal(membershipRepository.created.length, 1);
  assert.equal(membershipRepository.created[0].role, "admin");
  assert.equal(membershipRepository.created[0].userId, "user-1");
});
