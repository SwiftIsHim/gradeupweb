const Reaction = require("../../../domain/entities/Reaction");
const { NotFoundError } = require("../../../domain/errors");

/**
 * @param {{
 *   postRepository: import("../../../domain/ports").PostRepository,
 *   reactionRepository: import("../../../domain/ports").ReactionRepository,
 * }} deps
 */
function makeReactToPost({ postRepository, reactionRepository }) {
  return async function reactToPost(viewerId, postId, type) {
    // Validate shape before touching the post lookup.
    Reaction.create({ postId, userId: viewerId, type });

    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("That post doesn't exist.");
    }

    const existing = await reactionRepository.findOne(postId, viewerId);

    if (!existing) {
      await reactionRepository.create(Reaction.create({ postId, userId: viewerId, type }));
      await postRepository.incrementReactionCount(postId, 1);
      return { reacted: true, type };
    }

    if (existing.type === type) {
      await reactionRepository.deleteOne(postId, viewerId);
      await postRepository.incrementReactionCount(postId, -1);
      return { reacted: false, type: null };
    }

    await reactionRepository.updateType(postId, viewerId, type);
    return { reacted: true, type };
  };
}

module.exports = makeReactToPost;
