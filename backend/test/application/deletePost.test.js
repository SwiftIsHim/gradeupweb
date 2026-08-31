const test = require("node:test");
const assert = require("node:assert/strict");

const makeDeletePost = require("../../src/application/use-cases/posts/deletePost");
const { NotFoundError, UnauthorizedError } = require("../../src/domain/errors");

function makeFakePostRepository(post) {
  let deleted = false;
  return {
    async findById(id) {
      return !deleted && post && post.id === id ? post : null;
    },
    async deleteById() {
      deleted = true;
    },
    wasDeleted: () => deleted,
  };
}

function makeFakeCascadeRepository() {
  let deletedForPostId = null;
  return {
    async deleteByPostId(postId) {
      deletedForPostId = postId;
    },
    deletedFor: () => deletedForPostId,
  };
}

function makeFakeMembershipRepository(memberships) {
  return {
    async findOne(userId, communityId) {
      return memberships.find((m) => m.userId === userId && m.communityId === communityId) || null;
    },
  };
}

test("deletePost lets the author delete their own post", async () => {
  const post = { id: "post-1", communityId: null, isAuthor: (id) => id === "user-1" };
  const postRepository = makeFakePostRepository(post);
  const reactionRepository = makeFakeCascadeRepository();
  const commentRepository = makeFakeCascadeRepository();
  const deletePost = makeDeletePost({
    postRepository,
    membershipRepository: makeFakeMembershipRepository([]),
    reactionRepository,
    commentRepository,
  });

  await deletePost("user-1", "post-1");

  assert.ok(postRepository.wasDeleted());
  assert.equal(reactionRepository.deletedFor(), "post-1");
  assert.equal(commentRepository.deletedFor(), "post-1");
});

test("deletePost rejects a non-author, non-admin viewer", async () => {
  const post = { id: "post-1", communityId: null, isAuthor: (id) => id === "user-1" };
  const deletePost = makeDeletePost({
    postRepository: makeFakePostRepository(post),
    membershipRepository: makeFakeMembershipRepository([]),
    reactionRepository: makeFakeCascadeRepository(),
    commentRepository: makeFakeCascadeRepository(),
  });

  await assert.rejects(() => deletePost("user-2", "post-1"), UnauthorizedError);
});

test("deletePost lets a community admin delete another member's post", async () => {
  const post = { id: "post-1", communityId: "community-1", isAuthor: (id) => id === "user-1" };
  const memberships = [{ userId: "admin-1", communityId: "community-1", isAdmin: () => true }];
  const postRepository = makeFakePostRepository(post);
  const deletePost = makeDeletePost({
    postRepository,
    membershipRepository: makeFakeMembershipRepository(memberships),
    reactionRepository: makeFakeCascadeRepository(),
    commentRepository: makeFakeCascadeRepository(),
  });

  await deletePost("admin-1", "post-1");

  assert.ok(postRepository.wasDeleted());
});

test("deletePost rejects deleting a post that doesn't exist", async () => {
  const deletePost = makeDeletePost({
    postRepository: makeFakePostRepository(null),
    membershipRepository: makeFakeMembershipRepository([]),
    reactionRepository: makeFakeCascadeRepository(),
    commentRepository: makeFakeCascadeRepository(),
  });

  await assert.rejects(() => deletePost("user-1", "ghost"), NotFoundError);
});
