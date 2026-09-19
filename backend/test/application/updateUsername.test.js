const test = require("node:test");
const assert = require("node:assert/strict");

const makeUpdateUsername = require("../../src/application/use-cases/users/updateUsername");
const { ValidationError, ConflictError } = require("../../src/domain/errors");

function makeFakeUserRepository(initialUsers) {
  const byId = new Map(initialUsers.map((u) => [u.id, { ...u }]));
  return {
    async findByUsername(username) {
      return [...byId.values()].find((u) => u.username === username) || null;
    },
    async updateUsername(userId, username) {
      const user = byId.get(userId);
      user.username = username;
      return user;
    },
  };
}

test("updates to a free, valid username", async () => {
  const userRepository = makeFakeUserRepository([{ id: "user-1", username: "ada" }]);
  const updateUsername = makeUpdateUsername({ userRepository });

  const updated = await updateUsername("user-1", "ada.lovelace");

  assert.equal(updated.username, "ada.lovelace");
});

test("rejects an invalid username", async () => {
  const userRepository = makeFakeUserRepository([{ id: "user-1", username: "ada" }]);
  const updateUsername = makeUpdateUsername({ userRepository });

  await assert.rejects(() => updateUsername("user-1", "a"), ValidationError);
  await assert.rejects(() => updateUsername("user-1", "has spaces"), ValidationError);
});

test("rejects a username already taken by someone else", async () => {
  const userRepository = makeFakeUserRepository([
    { id: "user-1", username: "ada" },
    { id: "user-2", username: "grace" },
  ]);
  const updateUsername = makeUpdateUsername({ userRepository });

  await assert.rejects(() => updateUsername("user-1", "grace"), ConflictError);
});

test("re-saving your own current username is a no-op success", async () => {
  const userRepository = makeFakeUserRepository([{ id: "user-1", username: "ada" }]);
  const updateUsername = makeUpdateUsername({ userRepository });

  const updated = await updateUsername("user-1", "ada");

  assert.equal(updated.username, "ada");
});
