const test = require("node:test");
const assert = require("node:assert/strict");

const makeCreatePost = require("../../src/application/use-cases/posts/createPost");
const { ConflictError, UnauthorizedError } = require("../../src/domain/errors");

function makeFakePostRepository() {
  const created = [];
  let latestByAuthor = null;
  return {
    async findLatestByAuthor() {
      return latestByAuthor;
    },
    async create(post) {
      const stored = { ...post, id: `post-${created.length + 1}` };
      created.push(stored);
      latestByAuthor = post;
      return stored;
    },
    created,
  };
}

function makeFakeMembershipRepository(memberships) {
  return {
    async findOne(userId, communityId) {
      return memberships.find((m) => m.userId === userId && m.communityId === communityId) || null;
    },
  };
}

const scorePayload = { kind: "test", slug: "jamb-physics-1", title: "JAMB Physics Mock 1", score: 80, total: 100 };

test("createPost creates a 'score' post with no community", async () => {
  const postRepository = makeFakePostRepository();
  const createPost = makeCreatePost({ postRepository, membershipRepository: makeFakeMembershipRepository([]) });

  const post = await createPost("user-1", { communityId: null, type: "score", caption: "Nice", payload: scorePayload });

  assert.equal(post.type, "score");
  assert.equal(post.authorId, "user-1");
});

test("createPost creates a 'learning' post", async () => {
  const postRepository = makeFakePostRepository();
  const createPost = makeCreatePost({ postRepository, membershipRepository: makeFakeMembershipRepository([]) });

  const post = await createPost("user-1", { communityId: null, type: "learning", caption: "Learnt about torque." });

  assert.equal(post.type, "learning");
  assert.equal(post.caption, "Learnt about torque.");
});

test("createPost creates a 'quizShare' post", async () => {
  const postRepository = makeFakePostRepository();
  const createPost = makeCreatePost({ postRepository, membershipRepository: makeFakeMembershipRepository([]) });

  const post = await createPost("user-1", {
    communityId: null,
    type: "quizShare",
    payload: { kind: "test", slug: "jamb-physics-1", title: "JAMB Physics Mock 1", questionCount: 40 },
  });

  assert.equal(post.type, "quizShare");
});

test("createPost creates an 'examShare' post", async () => {
  const postRepository = makeFakePostRepository();
  const createPost = makeCreatePost({ postRepository, membershipRepository: makeFakeMembershipRepository([]) });

  const post = await createPost("user-1", {
    communityId: null,
    type: "examShare",
    payload: { kind: "diagnostic", slug: "mock-exam-1", title: "Mock Exam 1", questionCount: 60 },
  });

  assert.equal(post.type, "examShare");
});

test("createPost rejects posting into a community the viewer hasn't joined", async () => {
  const postRepository = makeFakePostRepository();
  const createPost = makeCreatePost({ postRepository, membershipRepository: makeFakeMembershipRepository([]) });

  await assert.rejects(
    () => createPost("user-1", { communityId: "community-1", type: "learning", caption: "note" }),
    UnauthorizedError
  );
});

test("createPost allows posting into a community the viewer has joined", async () => {
  const postRepository = makeFakePostRepository();
  const memberships = [{ userId: "user-1", communityId: "community-1" }];
  const createPost = makeCreatePost({ postRepository, membershipRepository: makeFakeMembershipRepository(memberships) });

  const post = await createPost("user-1", { communityId: "community-1", type: "learning", caption: "note" });

  assert.equal(post.communityId, "community-1");
});

test("createPost rejects an identical consecutive post from the same author", async () => {
  const postRepository = makeFakePostRepository();
  const createPost = makeCreatePost({ postRepository, membershipRepository: makeFakeMembershipRepository([]) });

  await createPost("user-1", { communityId: null, type: "learning", caption: "Learnt about torque." });
  await assert.rejects(
    () => createPost("user-1", { communityId: null, type: "learning", caption: "Learnt about torque." }),
    ConflictError
  );
});

test("createPost allows a different post right after a previous one", async () => {
  const postRepository = makeFakePostRepository();
  const createPost = makeCreatePost({ postRepository, membershipRepository: makeFakeMembershipRepository([]) });

  await createPost("user-1", { communityId: null, type: "learning", caption: "Learnt about torque." });
  const post = await createPost("user-1", { communityId: null, type: "learning", caption: "Learnt about momentum." });

  assert.equal(post.caption, "Learnt about momentum.");
});
