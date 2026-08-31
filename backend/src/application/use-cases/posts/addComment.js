const Comment = require("../../../domain/entities/Comment");
const { NotFoundError } = require("../../../domain/errors");

/**
 * @param {{
 *   postRepository: import("../../../domain/ports").PostRepository,
 *   commentRepository: import("../../../domain/ports").CommentRepository,
 * }} deps
 */
function makeAddComment({ postRepository, commentRepository }) {
  return async function addComment(viewerId, postId, body) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("That post doesn't exist.");
    }

    const comment = await commentRepository.create(Comment.create({ postId, userId: viewerId, body }));
    await postRepository.incrementCommentCount(postId, 1);
    return comment;
  };
}

module.exports = makeAddComment;
