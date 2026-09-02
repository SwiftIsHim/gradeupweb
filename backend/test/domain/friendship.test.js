const test = require("node:test");
const assert = require("node:assert/strict");

const Friendship = require("../../src/domain/entities/Friendship");
const { ValidationError } = require("../../src/domain/errors");

test("Friendship.request rejects a self-request", () => {
  assert.throws(() => Friendship.request("user-1", "user-1"), ValidationError);
});

test("Friendship.request creates a pending request", () => {
  const friendship = Friendship.request("user-1", "user-2");
  assert.equal(friendship.status, "pending");
  assert.equal(friendship.requesterId, "user-1");
  assert.equal(friendship.recipientId, "user-2");
});

test("accept() flips a pending request to accepted", () => {
  const friendship = Friendship.request("user-1", "user-2");
  friendship.accept();
  assert.equal(friendship.status, "accepted");
  assert.ok(friendship.respondedAt instanceof Date);
});

test("accept() rejects a request that isn't pending", () => {
  const friendship = Friendship.request("user-1", "user-2");
  friendship.accept();
  assert.throws(() => friendship.accept(), ValidationError);
});

test("otherUserId() resolves relative to either side", () => {
  const friendship = Friendship.request("user-1", "user-2");
  assert.equal(friendship.otherUserId("user-1"), "user-2");
  assert.equal(friendship.otherUserId("user-2"), "user-1");
});

test("isRequester()/isRecipient() identify each side", () => {
  const friendship = Friendship.request("user-1", "user-2");
  assert.ok(friendship.isRequester("user-1"));
  assert.ok(!friendship.isRequester("user-2"));
  assert.ok(friendship.isRecipient("user-2"));
  assert.ok(!friendship.isRecipient("user-1"));
});
