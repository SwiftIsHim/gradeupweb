const test = require("node:test");
const assert = require("node:assert/strict");

const makeSendFriendRequest = require("../../src/application/use-cases/peers/sendFriendRequest");
const { ValidationError, ConflictError, NotFoundError } = require("../../src/domain/errors");

function sortedKey(a, b) {
  return [String(a), String(b)].sort().join(":");
}

function makeFakeUserRepository(ids) {
  return {
    async findByIds(idsToFind) {
      return idsToFind.map((id) => (ids.has(id) ? { id } : null)).filter(Boolean);
    },
  };
}

function makeFakeFriendshipRepository() {
  const byPair = new Map();
  let nextId = 1;
  return {
    async findBetween(a, b) {
      return byPair.get(sortedKey(a, b)) || null;
    },
    async create(friendship) {
      const key = sortedKey(friendship.requesterId, friendship.recipientId);
      if (byPair.has(key)) {
        throw new ConflictError("A friend request already exists between these users.");
      }
      const stored = { ...friendship, id: `req-${nextId++}` };
      byPair.set(key, stored);
      return stored;
    },
  };
}

test("sends a pending request between two distinct existing users", async () => {
  const userRepository = makeFakeUserRepository(new Set(["user-1", "user-2"]));
  const friendshipRepository = makeFakeFriendshipRepository();
  const sendFriendRequest = makeSendFriendRequest({ userRepository, friendshipRepository });

  const request = await sendFriendRequest("user-1", "user-2");

  assert.equal(request.status, "pending");
  assert.equal(request.requesterId, "user-1");
  assert.equal(request.recipientId, "user-2");
});

test("rejects sending a request to yourself", async () => {
  const userRepository = makeFakeUserRepository(new Set(["user-1"]));
  const friendshipRepository = makeFakeFriendshipRepository();
  const sendFriendRequest = makeSendFriendRequest({ userRepository, friendshipRepository });

  await assert.rejects(() => sendFriendRequest("user-1", "user-1"), ValidationError);
});

test("rejects a request to a user that doesn't exist", async () => {
  const userRepository = makeFakeUserRepository(new Set(["user-1"]));
  const friendshipRepository = makeFakeFriendshipRepository();
  const sendFriendRequest = makeSendFriendRequest({ userRepository, friendshipRepository });

  await assert.rejects(() => sendFriendRequest("user-1", "ghost"), NotFoundError);
});

test("rejects a duplicate request regardless of direction", async () => {
  const userRepository = makeFakeUserRepository(new Set(["user-1", "user-2"]));
  const friendshipRepository = makeFakeFriendshipRepository();
  const sendFriendRequest = makeSendFriendRequest({ userRepository, friendshipRepository });

  await sendFriendRequest("user-1", "user-2");
  await assert.rejects(() => sendFriendRequest("user-2", "user-1"), ConflictError);
});
