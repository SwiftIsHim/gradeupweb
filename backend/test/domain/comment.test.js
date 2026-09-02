const test = require("node:test");
const assert = require("node:assert/strict");

const Comment = require("../../src/domain/entities/Comment");
const { ValidationError } = require("../../src/domain/errors");

test("Comment.create trims the body", () => {
  const comment = Comment.create({ postId: "post-1", userId: "user-1", body: "  Nice one!  " });
  assert.equal(comment.body, "Nice one!");
});

test("Comment.create rejects an empty body", () => {
  assert.throws(() => Comment.create({ postId: "post-1", userId: "user-1", body: "   " }), ValidationError);
});

test("Comment.create rejects a body over 500 characters", () => {
  assert.throws(
    () => Comment.create({ postId: "post-1", userId: "user-1", body: "x".repeat(501) }),
    ValidationError
  );
});
