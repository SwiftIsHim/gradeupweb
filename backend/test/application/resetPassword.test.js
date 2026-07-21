const test = require("node:test");
const assert = require("node:assert/strict");

const makeResetPassword = require("../../src/application/use-cases/auth/resetPassword");
const User = require("../../src/domain/entities/User");
const { ValidationError, UnauthorizedError } = require("../../src/domain/errors");

const fakePasswordHasher = {
  async hash(plain) {
    return `hashed:${plain}`;
  },
  async verify(plain, hash) {
    return hash === `hashed:${plain}`;
  },
};

function makeFakeUserRepository(user) {
  return {
    updates: [],
    async findByResetTokenHash(tokenHash) {
      return user && user.passwordResetTokenHash === tokenHash ? user : null;
    },
    async updatePassword(userId, passwordHash) {
      this.updates.push({ userId, passwordHash });
      user.passwordHash = passwordHash;
      user.passwordResetTokenHash = null;
      user.passwordResetTokenExpiresAt = null;
      return user;
    },
  };
}

test("resetPassword updates the password and clears the token for a valid token", async () => {
  const { rawToken, tokenHash } = User.generateResetToken();
  const user = new User({
    id: "user-1",
    email: "a@b.com",
    phone: "+2348012345678",
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: new Date(Date.now() + 60_000),
  });
  const userRepository = makeFakeUserRepository(user);
  const resetPassword = makeResetPassword({ userRepository, passwordHasher: fakePasswordHasher });

  const result = await resetPassword(rawToken, "newsecret1");

  assert.deepEqual(result, { ok: true });
  assert.equal(userRepository.updates[0].passwordHash, "hashed:newsecret1");
  assert.equal(user.passwordResetTokenHash, null);
});

test("resetPassword rejects an expired token", async () => {
  const { rawToken, tokenHash } = User.generateResetToken();
  const user = new User({
    id: "user-1",
    email: "a@b.com",
    phone: "+2348012345678",
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: new Date(Date.now() - 1000),
  });
  const userRepository = makeFakeUserRepository(user);
  const resetPassword = makeResetPassword({ userRepository, passwordHasher: fakePasswordHasher });

  await assert.rejects(() => resetPassword(rawToken, "newsecret1"), UnauthorizedError);
});

test("resetPassword rejects an unknown token", async () => {
  const userRepository = makeFakeUserRepository(null);
  const resetPassword = makeResetPassword({ userRepository, passwordHasher: fakePasswordHasher });

  await assert.rejects(() => resetPassword("not-a-real-token", "newsecret1"), UnauthorizedError);
});

test("resetPassword rejects a password shorter than 8 characters", async () => {
  const { rawToken, tokenHash } = User.generateResetToken();
  const user = new User({
    id: "user-1",
    email: "a@b.com",
    phone: "+2348012345678",
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: new Date(Date.now() + 60_000),
  });
  const userRepository = makeFakeUserRepository(user);
  const resetPassword = makeResetPassword({ userRepository, passwordHasher: fakePasswordHasher });

  await assert.rejects(() => resetPassword(rawToken, "short"), ValidationError);
});
