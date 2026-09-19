const { NotFoundError, UnauthorizedError } = require("../../../domain/errors");

/**
 * @param {{
 *   postRepository: import("../../../domain/ports").PostRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 *   reactionRepository: import("../../../domain/ports").ReactionRepository,
 *   commentRepository: import("../../../domain/ports").CommentRepository,
 * }} deps
 */
function makeDeletePost({ postRepository, membershipRepository, reactionRepository, commentRepository }) {
  return async function deletePost(viewerId, postId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("That post doesn't exist.");
    }

    let allowed = post.isAuthor(viewerId);
    if (!allowed && post.communityId) {
      const membership = await membershipRepository.findOne(viewerId, post.communityId);
      allowed = Boolean(membership?.isAdmin());
    }
    if (!allowed) {
      throw new UnauthorizedError("You can't delete this post.");
    }

    await postRepository.deleteById(postId);
    await Promise.all([reactionRepository.deleteByPostId(postId), commentRepository.deleteByPostId(postId)]);
  };
}

module.exports = makeDeletePost;
