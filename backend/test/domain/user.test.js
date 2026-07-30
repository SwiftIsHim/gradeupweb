const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../../src/domain/entities/User");

test("generateResetToken returns a raw token and its sha256 hash", () => {
  const { rawToken, tokenHash } = User.generateResetToken();
  assert.equal(rawToken.length, 64); // 32 bytes hex-encoded
  assert.equal(tokenHash, User.hashResetToken(rawToken));
  assert.notEqual(tokenHash, rawToken);
});

test("isResetTokenValid is true only for a matching, unexpired hash", () => {
  const { rawToken, tokenHash } = User.generateResetToken();
  const user = new User({
    email: "a@b.com",
    phone: "+2348012345678",
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: new Date(Date.now() + 60_000),
  });

  assert.equal(user.isResetTokenValid(tokenHash), true);
  assert.equal(user.isResetTokenValid(User.hashResetToken("wrong-token")), false);
});

test("isResetTokenValid is false once expired", () => {
  const { rawToken, tokenHash } = User.generateResetToken();
  const user = new User({
    email: "a@b.com",
    phone: "+2348012345678",
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: new Date(Date.now() - 1000),
  });

  assert.equal(user.isResetTokenValid(tokenHash), false);
  assert.ok(rawToken);
});

test("isResetTokenValid is false when no token was ever set", () => {
  const user = new User({ email: "a@b.com", phone: "+2348012345678" });
  assert.equal(user.isResetTokenValid(User.hashResetToken("anything")), false);
});
