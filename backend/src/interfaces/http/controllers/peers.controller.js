const asyncHandler = require("../asyncHandler");
const { ValidationError } = require("../../../domain/errors");

function makePeersController({
  searchUsers,
  listPeers,
  listFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
}) {
  // GET /peers/search?q=... -> { results: [...] }
  const search = asyncHandler(async (req, res) => {
    const results = await searchUsers(req.user.id, req.query.q);
    res.json({ results });
  });

  // GET /peers -> { peers: [...] }
  const list = asyncHandler(async (req, res) => {
    const peers = await listPeers(req.user.id);
    res.json({ peers });
  });

  // GET /peers/requests -> { incoming: [...], outgoing: [...] }
  const requests = asyncHandler(async (req, res) => {
    const result = await listFriendRequests(req.user.id);
    res.json(result);
  });

  // POST /peers/requests { recipientId } -> { request }
  const sendRequest = asyncHandler(async (req, res) => {
    const { recipientId } = req.body;
    if (!recipientId) {
      throw new ValidationError("recipientId is required.", { field: "recipientId" });
    }
    const request = await sendFriendRequest(req.user.id, recipientId);
    res.status(201).json({ request: request.toPublic() });
  });

  // POST /peers/requests/:id/accept -> { peer }
  const accept = asyncHandler(async (req, res) => {
    const friendship = await acceptFriendRequest(req.user.id, req.params.id);
    res.json({ request: friendship.toPublic() });
  });

  // POST /peers/requests/:id/decline -> { ok: true }
  const decline = asyncHandler(async (req, res) => {
    await declineFriendRequest(req.user.id, req.params.id);
    res.json({ ok: true });
  });

  // DELETE /peers/requests/:id -> { ok: true }
  const cancel = asyncHandler(async (req, res) => {
    await cancelFriendRequest(req.user.id, req.params.id);
    res.json({ ok: true });
  });

  return { search, list, requests, sendRequest, accept, decline, cancel };
}

module.exports = makePeersController;
