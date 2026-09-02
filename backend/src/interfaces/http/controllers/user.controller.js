const asyncHandler = require("../asyncHandler");
const { ValidationError } = require("../../../domain/errors");

function makeUserController({ updateUsername }) {
  // GET /users/me -> { user }
  // requireAuth already loaded the full entity onto req.user.
  const getMe = asyncHandler(async (req, res) => {
    res.json({ user: req.user.toPublic() });
  });

  // PATCH /users/me/username { username } -> { user }
  const patchUsername = asyncHandler(async (req, res) => {
    const { username } = req.body;
    if (!username) {
      throw new ValidationError("username is required.", { field: "username" });
    }
    const user = await updateUsername(req.user.id, username);
    res.json({ user: user.toPublic() });
  });

  return { getMe, patchUsername };
}

module.exports = makeUserController;
