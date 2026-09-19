const test = require("node:test");
const assert = require("node:assert/strict");

const Reaction = require("../../src/domain/entities/Reaction");
const { ValidationError } = require("../../src/domain/errors");

test("Reaction.create accepts 'like'", () => {
  const reaction = Reaction.create({ postId: "post-1", userId: "user-1", type: "like" });
  assert.equal(reaction.type, "like");
});

test("Reaction.create accepts 'clap'", () => {
  const reaction = Reaction.create({ postId: "post-1", userId: "user-1", type: "clap" });
  assert.equal(reaction.type, "clap");
});

test("Reaction.create rejects an unknown type", () => {
  assert.throws(() => Reaction.create({ postId: "post-1", userId: "user-1", type: "love" }), ValidationError);
});

test("Reaction.create requires both a post and a user", () => {
  assert.throws(() => Reaction.create({ postId: null, userId: "user-1", type: "like" }), ValidationError);
  assert.throws(() => Reaction.create({ postId: "post-1", userId: null, type: "like" }), ValidationError);
});
