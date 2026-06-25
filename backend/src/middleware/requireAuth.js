const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { decodeAccessToken } = require("../utils/sessionToken");
const User = require("../models/user.model");

/**
 * Gate a route behind a valid session. Reads `Authorization: Bearer <token>`,
 * decodes the stub access token back to an email, loads the user, and attaches
 * it as `req.user`. Swap the decode step for real token verification once the
 * Civilpromo GraphQL auth is wired up.
 */
module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("Missing or invalid Authorization header.");
  }

  const email = decodeAccessToken(token);
  if (!email) {
    throw ApiError.unauthorized("Invalid or expired session.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.unauthorized("Session user no longer exists.");
  }

  req.user = user;
  next();
});
