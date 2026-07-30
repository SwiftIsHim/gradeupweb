const { ValidationError, UnauthorizedError } = require("../../../domain/errors");
const User = require("../../../domain/entities/User");

/**
 * @param {{
 *   userRepository: import("../../../domain/ports").UserRepository,
 *   passwordHasher: import("../../../domain/ports").PasswordHasher,
 * }} deps
 */
function makeResetPassword({ userRepository, passwordHasher }) {
  return async function resetPassword(rawToken, rawPassword) {
    if (!rawToken) {
      throw new ValidationError("Reset token is required.", { field: "token" });
    }
    if (!rawPassword) {
      throw new ValidationError("Password is required.", { field: "password" });
    }
    const password = String(rawPassword);
    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters.", { field: "password" });
    }

    const tokenHash = User.hashResetToken(rawToken);
    const user = await userRepository.findByResetTokenHash(tokenHash);
    if (!user || !user.isResetTokenValid(tokenHash)) {
      throw new UnauthorizedError("This reset link is invalid or has expired.");
    }

    const passwordHash = await passwordHasher.hash(password);
    // Also clears the reset-token fields, so the link is single-use.
    await userRepository.updatePassword(user.id, passwordHash);
    return { ok: true };
  };
}

module.exports = makeResetPassword;
