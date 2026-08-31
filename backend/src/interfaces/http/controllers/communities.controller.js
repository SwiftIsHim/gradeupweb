const asyncHandler = require("../asyncHandler");
const { ValidationError } = require("../../../domain/errors");

function makeCommunitiesController({
  discoverCommunities,
  listMyCommunities,
  suggestCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  removeMember,
}) {
  // GET /communities?q=... -> { communities: [...] }
  const discover = asyncHandler(async (req, res) => {
    const communities = await discoverCommunities(req.user.id, req.query.q);
    res.json({ communities });
  });

  // GET /communities/mine -> { communities: [...] }
  const mine = asyncHandler(async (req, res) => {
    const communities = await listMyCommunities(req.user.id);
    res.json({ communities });
  });

  // GET /communities/suggestions -> { communities: [...] }
  const suggestions = asyncHandler(async (req, res) => {
    const communities = await suggestCommunities(req.user.id);
    res.json({ communities });
  });

  // POST /communities { name, description, examTag, subjects } -> { community }
  const create = asyncHandler(async (req, res) => {
    const { name, description, examTag, subjects } = req.body;
    if (!name) {
      throw new ValidationError("name is required.", { field: "name" });
    }
    const community = await createCommunity(req.user.id, { name, description, examTag, subjects });
    res.status(201).json({ community });
  });

  // POST /communities/:id/join -> { community }
  const join = asyncHandler(async (req, res) => {
    const community = await joinCommunity(req.user.id, req.params.id);
    res.json({ community });
  });

  // POST /communities/:id/leave -> { ok: true }
  const leave = asyncHandler(async (req, res) => {
    await leaveCommunity(req.user.id, req.params.id);
    res.json({ ok: true });
  });

  // DELETE /communities/:id/members/:userId -> { ok: true }
  const removeMemberHandler = asyncHandler(async (req, res) => {
    await removeMember(req.user.id, req.params.id, req.params.userId);
    res.json({ ok: true });
  });

  return { discover, mine, suggestions, create, join, leave, removeMember: removeMemberHandler };
}

module.exports = makeCommunitiesController;
