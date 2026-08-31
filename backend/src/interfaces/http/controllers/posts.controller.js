const asyncHandler = require("../asyncHandler");
const { ValidationError } = require("../../../domain/errors");

function makePostsController({ createPost, deletePost, reactToPost, listComments, addComment }) {
  // POST /posts { communityId, type, caption, payload } -> { post }
  const create = asyncHandler(async (req, res) => {
    const { communityId, type, caption, payload } = req.body;
    if (!type) {
      throw new ValidationError("type is required.", { field: "type" });
    }
    const post = await createPost(req.user.id, { communityId, type, caption, payload });
    // Matches getFeed's DTO shape (author + viewerReaction attached) so the
    // client can prepend this response straight into the feed list.
    res.status(201).json({ post: { ...post.toPublic(), author: req.user.toPeerSummary(), viewerReaction: null } });
  });

  // DELETE /posts/:id -> { ok: true }
  const remove = asyncHandler(async (req, res) => {
    await deletePost(req.user.id, req.params.id);
    res.json({ ok: true });
  });

  // POST /posts/:id/react { type } -> { reacted, type }
  const react = asyncHandler(async (req, res) => {
    const { type } = req.body;
    if (!type) {
      throw new ValidationError("type is required.", { field: "type" });
    }
    const result = await reactToPost(req.user.id, req.params.id, type);
    res.json(result);
  });

  // GET /posts/:id/comments -> { comments: [...] }
  const comments = asyncHandler(async (req, res) => {
    const list = await listComments(req.params.id);
    res.json({ comments: list });
  });

  // POST /posts/:id/comments { body } -> { comment }
  const addCommentHandler = asyncHandler(async (req, res) => {
    const { body } = req.body;
    if (!body) {
      throw new ValidationError("body is required.", { field: "body" });
    }
    const comment = await addComment(req.user.id, req.params.id, body);
    // Matches listComments's DTO shape (author attached) for the same reason.
    res.status(201).json({ comment: { ...comment.toPublic(), author: req.user.toPeerSummary() } });
  });

  return { create, remove, react, comments, addComment: addCommentHandler };
}

module.exports = makePostsController;
