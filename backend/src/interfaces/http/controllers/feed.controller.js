const asyncHandler = require("../asyncHandler");

function makeFeedController({ getFeed }) {
  // GET /feed?communityId=&cursor=&limit= -> { items: [...], nextCursor }
  const get = asyncHandler(async (req, res) => {
    const { communityId, cursor, limit } = req.query;
    const feed = await getFeed(req.user.id, { communityId, cursor, limit: limit ? Number(limit) : undefined });
    res.json(feed);
  });

  return { get };
}

module.exports = makeFeedController;
