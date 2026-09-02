const test = require("node:test");
const assert = require("node:assert/strict");

const Membership = require("../../src/domain/entities/Membership");
const { ValidationError } = require("../../src/domain/errors");

test("Membership.join defaults to role 'member'", () => {
  const membership = Membership.join("user-1", "community-1");
  assert.equal(membership.role, "member");
  assert.equal(membership.isAdmin(), false);
});

test("Membership.join accepts an explicit 'admin' role", () => {
  const membership = Membership.join("user-1", "community-1", "admin");
  assert.equal(membership.role, "admin");
  assert.equal(membership.isAdmin(), true);
});

test("Membership.join rejects an invalid role", () => {
  assert.throws(() => Membership.join("user-1", "community-1", "owner"), ValidationError);
});

test("Membership.join requires both a user and a community", () => {
  assert.throws(() => Membership.join(null, "community-1"), ValidationError);
  assert.throws(() => Membership.join("user-1", null), ValidationError);
});
