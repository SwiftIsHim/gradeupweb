function clamp(value, min, max) {
  const n = Number.isInteger(value) ? value : parseInt(value, 10);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/**
 * @param {{
 *   postRepository: import("../../../domain/ports").PostRepository,
 *   membershipRepository: import("../../../domain/ports").MembershipRepository,
 *   userRepository: import("../../../domain/ports").UserRepository,
 *   reactionRepository: import("../../../domain/ports").ReactionRepository,
 * }} deps
 */
function makeGetFeed({ postRepository, membershipRepository, userRepository, reactionRepository }) {
  return async function getFeed(viewerId, { communityId, cursor, limit } = {}) {
    let joinedCommunityIds = [];
    if (!communityId) {
      const memberships = await membershipRepository.listByUser(viewerId);
      joinedCommunityIds = memberships.map((m) => m.communityId);
    }

    const { items, nextCursor } = await postRepository.listFeed({
      communityId: communityId || null,
      joinedCommunityIds,
      cursor: cursor || null,
      limit: clamp(limit, 1, 50),
    });

    if (!items.length) return { items: [], nextCursor: null };

    const authorIds = [...new Set(items.map((p) => p.authorId))];
    const [authors, viewerReactions] = await Promise.all([
      userRepository.findByIds(authorIds),
      reactionRepository.listByPostIdsForUser(
        items.map((p) => p.id),
        viewerId
      ),
    ]);

    const authorById = new Map(authors.map((u) => [String(u.id), u]));
    const reactionByPostId = new Map(viewerReactions.map((r) => [String(r.postId), r.type]));

    return {
      items: items.map((post) => ({
        ...post.toPublic(),
        author: authorById.get(String(post.authorId))?.toPeerSummary() ?? null,
        viewerReaction: reactionByPostId.get(String(post.id)) ?? null,
      })),
      nextCursor,
    };
  };
}

module.exports = makeGetFeed;
