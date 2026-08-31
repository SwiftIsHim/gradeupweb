const Post = require("../../../domain/entities/Post");
const { ConflictError, UnauthorizedError } = require("../../../domain/errors");

function isSameContent(a, b) {
  return (
    a.type === b.type &&
    String(a.communityId ?? "") === String(b.communityId ?? "") &&
    a.caption === b.caption &&
    JSON.stringify(a.payload) === JSON.stringify(b.payload)
  );
}

/**
 * @param {{
 *   postRepository: import("../../../domain/ports").PostRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 * }} deps
 */
function makeCreatePost({ postRepository, membershipRepository }) {
  return async function createPost(viewerId, { communityId, type, caption, payload }) {
    if (communityId) {
      const membership = await membershipRepository.findOne(viewerId, communityId);
      if (!membership) {
        throw new UnauthorizedError("Join the community to post here.");
      }
    }

    const post = Post.create({ authorId: viewerId, communityId: communityId || null, type, caption, payload });

    const latest = await postRepository.findLatestByAuthor(viewerId);
    if (latest && isSameContent(latest, post)) {
      throw new ConflictError("You've already shared this — try adding something new.");
    }

    return postRepository.create(post);
  };
}

module.exports = makeCreatePost;
