const { assertValidEmail } = require("../../../domain/valueObjects/Email");
const { ValidationError, UnauthorizedError } = require("../../../domain/errors");
const issueSession = require("./issueSession");

/**
 * @param {{
 *   userRepository: import("../../../domain/ports").UserRepository,
 *   passwordHasher: import("../../../domain/ports").PasswordHasher,
 *   tokenService: import("../../../domain/ports").TokenService,
 * }} deps
 */
function makeLogin({ userRepository, passwordHasher, tokenService }) {
  /** Step 2 — email + password login. */
  return async function login(rawEmail, rawPassword) {
    const email = assertValidEmail(rawEmail);
    if (!rawPassword) {
      throw new ValidationError("Password is required.", { field: "password" });
    }

    const user = await userRepository.findByEmailWithPasswordHash(email);
    if (!user) {
      throw new UnauthorizedError("No account found for this email.");
    }
    const ok = await user.verifyPassword(String(rawPassword), passwordHasher);
    if (!ok) {
      throw new UnauthorizedError("Incorrect password. Try again.");
    }
    return issueSession(user, tokenService);
  };
}

module.exports = makeLogin;
