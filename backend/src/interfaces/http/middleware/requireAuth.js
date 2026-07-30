const asyncHandler = require("../asyncHandler");
const { UnauthorizedError } = require("../../../domain/errors");

/**
 * Gate a route behind a valid session. Reads `Authorization: Bearer <token>`,
 * decodes it via the injected TokenService, loads the user via the injected
 * UserRepository, and attaches it as `req.user`.
 *
 * @param {{
 *   tokenService: import("../../../domain/ports").TokenService,
 *   userRepository: import("../../../domain/ports").UserRepository,
 * }} deps
 */
function makeRequireAuth({ tokenService, userRepository }) {
  return asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedError("Missing or invalid Authorization header.");
    }

    const email = tokenService.decodeEmail(token);
    if (!email) {
      throw new UnauthorizedError("Invalid or expired session.");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Session user no longer exists.");
    }

    req.user = user;
    next();
  });
}

module.exports = makeRequireAuth;
