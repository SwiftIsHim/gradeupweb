const test = require("node:test");
const assert = require("node:assert/strict");

const makeRequestPasswordReset = require("../../src/application/use-cases/auth/requestPasswordReset");
const User = require("../../src/domain/entities/User");

function makeFakeUserRepository(seedUsers = []) {
  const byId = new Map(seedUsers.map((u) => [u.id, u]));
  return {
    byId,
    async findByEmail(email) {
      return [...byId.values()].find((u) => u.email === email) || null;
    },
    async setResetToken(userId, tokenHash, expiresAt) {
      const user = byId.get(userId);
      user.passwordResetTokenHash = tokenHash;
      user.passwordResetTokenExpiresAt = expiresAt;
    },
  };
}

function makeFakeEmailSender() {
  const sent = [];
  return {
    sent,
    async send(message) {
      sent.push(message);
    },
  };
}

test("requestPasswordReset stores a token and emails a reset link when the account exists", async () => {
  const existingUser = new User({ id: "user-1", email: "known@example.com", phone: "+2348012345678" });
  const userRepository = makeFakeUserRepository([existingUser]);
  const emailSender = makeFakeEmailSender();
  const requestPasswordReset = makeRequestPasswordReset({
    userRepository,
    emailSender,
    frontendUrl: "http://localhost:3000",
    tokenTtlSeconds: 3600,
  });

  const result = await requestPasswordReset("known@example.com");

  assert.deepEqual(result, { ok: true });
  assert.ok(userRepository.byId.get("user-1").passwordResetTokenHash);
  assert.equal(emailSender.sent.length, 1);
  assert.match(emailSender.sent[0].html, /reset-password\?token=/);
});

test("requestPasswordReset returns the same response when the account doesn't exist", async () => {
  const userRepository = makeFakeUserRepository([]);
  const emailSender = makeFakeEmailSender();
  const requestPasswordReset = makeRequestPasswordReset({
    userRepository,
    emailSender,
    frontendUrl: "http://localhost:3000",
    tokenTtlSeconds: 3600,
  });

  const result = await requestPasswordReset("nobody@example.com");

  assert.deepEqual(result, { ok: true });
  assert.equal(emailSender.sent.length, 0);
});
