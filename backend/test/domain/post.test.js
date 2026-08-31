const test = require("node:test");
const assert = require("node:assert/strict");

const Post = require("../../src/domain/entities/Post");
const { ValidationError } = require("../../src/domain/errors");

test("Post.create builds a 'score' post", () => {
  const post = Post.create({
    authorId: "user-1",
    communityId: null,
    type: "score",
    caption: "Nailed it",
    payload: { kind: "test", slug: "jamb-physics-1", title: "JAMB Physics Mock 1", score: 85, total: 100 },
  });
  assert.equal(post.type, "score");
  assert.equal(post.payload.score, 85);
});

test("Post.create rejects a 'score' post where score > total", () => {
  assert.throws(
    () =>
      Post.create({
        authorId: "user-1",
        type: "score",
        payload: { kind: "test", slug: "s", title: "t", score: 120, total: 100 },
      }),
    ValidationError
  );
});

test("Post.create builds a 'learning' post from the caption", () => {
  const post = Post.create({ authorId: "user-1", type: "learning", caption: "Learnt about torque today." });
  assert.equal(post.caption, "Learnt about torque today.");
  assert.equal(post.payload, null);
});

test("Post.create rejects a 'learning' post with an empty caption", () => {
  assert.throws(() => Post.create({ authorId: "user-1", type: "learning", caption: "   " }), ValidationError);
});

test("Post.create builds a 'quizShare' post", () => {
  const post = Post.create({
    authorId: "user-1",
    type: "quizShare",
    payload: { kind: "test", slug: "jamb-physics-1", title: "JAMB Physics Mock 1", subject: "Physics", questionCount: 40, bestScore: 85 },
  });
  assert.equal(post.type, "quizShare");
  assert.equal(post.payload.kind, "test");
});

test("Post.create rejects a 'quizShare' post whose payload.kind isn't 'test'", () => {
  assert.throws(
    () =>
      Post.create({
        authorId: "user-1",
        type: "quizShare",
        payload: { kind: "diagnostic", slug: "s", title: "t", questionCount: 10 },
      }),
    ValidationError
  );
});

test("Post.create builds an 'examShare' post", () => {
  const post = Post.create({
    authorId: "user-1",
    type: "examShare",
    payload: { kind: "diagnostic", slug: "mock-exam-1", title: "Mock Exam 1", subject: null, questionCount: 60 },
  });
  assert.equal(post.type, "examShare");
  assert.equal(post.payload.kind, "diagnostic");
  assert.equal(post.payload.bestScore, null);
});

test("Post.create rejects an 'examShare' post whose payload.kind isn't 'diagnostic'", () => {
  assert.throws(
    () =>
      Post.create({
        authorId: "user-1",
        type: "examShare",
        payload: { kind: "test", slug: "s", title: "t", questionCount: 10 },
      }),
    ValidationError
  );
});

test("Post.create rejects an invalid questionCount", () => {
  assert.throws(
    () =>
      Post.create({
        authorId: "user-1",
        type: "quizShare",
        payload: { kind: "test", slug: "s", title: "t", questionCount: 0 },
      }),
    ValidationError
  );
});

test("Post.create rejects an out-of-range bestScore", () => {
  assert.throws(
    () =>
      Post.create({
        authorId: "user-1",
        type: "quizShare",
        payload: { kind: "test", slug: "s", title: "t", questionCount: 10, bestScore: 150 },
      }),
    ValidationError
  );
});

test("Post.create rejects an unknown type", () => {
  assert.throws(() => Post.create({ authorId: "user-1", type: "poll" }), ValidationError);
});

test("Post.create rejects a caption over 500 characters for non-learning posts", () => {
  assert.throws(
    () =>
      Post.create({
        authorId: "user-1",
        type: "score",
        caption: "x".repeat(501),
        payload: { kind: "test", slug: "s", title: "t", score: 1, total: 1 },
      }),
    ValidationError
  );
});

test("isAuthor() compares the author id as a string", () => {
  const post = Post.create({ authorId: "user-1", type: "learning", caption: "note" });
  assert.ok(post.isAuthor("user-1"));
  assert.ok(!post.isAuthor("user-2"));
});
