const test = require("node:test");
const assert = require("node:assert/strict");

const makeReactToPost = require("../../src/application/use-cases/posts/reactToPost");
const { NotFoundError } = require("../../src/domain/errors");

function makeFakePostRepository(exists) {
  let reactionCount = 0;
  return {
    async findById(id) {
      return exists ? { id } : null;
    },
    async incrementReactionCount(id, delta) {
      reactionCount += delta;
    },
    reactionCount: () => reactionCount,
  };
}

function makeFakeReactionRepository() {
  const byKey = new Map();
  const key = (postId, userId) => `${postId}:${userId}`;
  return {
    async findOne(postId, userId) {
      return byKey.get(key(postId, userId)) || null;
    },
    async create(reaction) {
      byKey.set(key(reaction.postId, reaction.userId), reaction);
      return reaction;
    },
    async deleteOne(postId, userId) {
      byKey.delete(key(postId, userId));
    },
    async updateType(postId, userId, type) {
      const reaction = byKey.get(key(postId, userId));
      reaction.type = type;
      return reaction;
    },
  };
}

test("reactToPost creates a reaction and increments the count on first react", async () => {
  const postRepository = makeFakePostRepository(true);
  const reactToPost = makeReactToPost({ postRepository, reactionRepository: makeFakeReactionRepository() });

  const result = await reactToPost("user-1", "post-1", "like");

  assert.deepEqual(result, { reacted: true, type: "like" });
  assert.equal(postRepository.reactionCount(), 1);
});

test("reactToPost toggles off when reacting with the same type again", async () => {
  const postRepository = makeFakePostRepository(true);
  const reactToPost = makeReactToPost({ postRepository, reactionRepository: makeFakeReactionRepository() });

  await reactToPost("user-1", "post-1", "like");
  const result = await reactToPost("user-1", "post-1", "like");

  assert.deepEqual(result, { reacted: false, type: null });
  assert.equal(postRepository.reactionCount(), 0);
});

test("reactToPost switches type without double-counting", async () => {
  const postRepository = makeFakePostRepository(true);
  const reactToPost = makeReactToPost({ postRepository, reactionRepository: makeFakeReactionRepository() });

  await reactToPost("user-1", "post-1", "like");
  const result = await reactToPost("user-1", "post-1", "clap");

  assert.deepEqual(result, { reacted: true, type: "clap" });
  assert.equal(postRepository.reactionCount(), 1);
});

test("reactToPost rejects reacting to a post that doesn't exist", async () => {
  const reactToPost = makeReactToPost({
    postRepository: makeFakePostRepository(false),
    reactionRepository: makeFakeReactionRepository(),
  });

  await assert.rejects(() => reactToPost("user-1", "ghost", "like"), NotFoundError);
});
