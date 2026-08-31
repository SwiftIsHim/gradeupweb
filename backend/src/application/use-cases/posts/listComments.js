/**
 * @param {{
 *   commentRepository: import("../../../domain/ports").CommentRepository,
 *   userRepository: import("../../../domain/ports").UserRepository,
 * }} deps
 */
function makeListComments({ commentRepository, userRepository }) {
  return async function listComments(postId) {
    const comments = await commentRepository.listByPost(postId);
    if (!comments.length) return [];

    const authorIds = [...new Set(comments.map((c) => c.userId))];
    const authors = await userRepository.findByIds(authorIds);
    const authorById = new Map(authors.map((u) => [String(u.id), u]));

    return comments.map((comment) => ({
      ...comment.toPublic(),
      author: authorById.get(String(comment.userId))?.toPeerSummary() ?? null,
    }));
  };
}

module.exports = makeListComments;
