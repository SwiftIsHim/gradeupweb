const test = require("node:test");
const assert = require("node:assert/strict");

const makeAddComment = require("../../src/application/use-cases/posts/addComment");
const { ValidationError, NotFoundError } = require("../../src/domain/errors");

function makeFakePostRepository(exists) {
  let commentCount = 0;
  return {
    async findById(id) {
      return exists ? { id } : null;
    },
    async incrementCommentCount(id, delta) {
      commentCount += delta;
    },
    commentCount: () => commentCount,
  };
}

function makeFakeCommentRepository() {
  const created = [];
  return {
    async create(comment) {
      const stored = { ...comment, id: `comment-${created.length + 1}` };
      created.push(stored);
      return stored;
    },
    created,
  };
}

test("addComment creates a comment and increments the post's commentCount", async () => {
  const postRepository = makeFakePostRepository(true);
  const commentRepository = makeFakeCommentRepository();
  const addComment = makeAddComment({ postRepository, commentRepository });

  const comment = await addComment("user-1", "post-1", "Great work!");

  assert.equal(comment.body, "Great work!");
  assert.equal(postRepository.commentCount(), 1);
});

test("addComment rejects an empty body", async () => {
  const addComment = makeAddComment({
    postRepository: makeFakePostRepository(true),
    commentRepository: makeFakeCommentRepository(),
  });

  await assert.rejects(() => addComment("user-1", "post-1", "   "), ValidationError);
});

test("addComment rejects commenting on a post that doesn't exist", async () => {
  const addComment = makeAddComment({
    postRepository: makeFakePostRepository(false),
    commentRepository: makeFakeCommentRepository(),
  });

  await assert.rejects(() => addComment("user-1", "ghost", "hi"), NotFoundError);
});
