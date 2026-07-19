const { assertValidEmail } = require("../../../domain/valueObjects/Email");
const User = require("../../../domain/entities/User");
const { passwordResetEmail } = require("../../notifications/emailTemplates");

/**
 * @param {{
 *   userRepository: import("../../../domain/ports").UserRepository,
 *   emailSender: import("../../../domain/ports").EmailSender,
 *   frontendUrl: string,
 *   tokenTtlSeconds: number,
 * }} deps
 */
function makeRequestPasswordReset({ userRepository, emailSender, frontendUrl, tokenTtlSeconds }) {
  return async function requestPasswordReset(rawEmail) {
    const email = assertValidEmail(rawEmail);
    const user = await userRepository.findByEmail(email);

    if (user) {
      const { rawToken, tokenHash } = User.generateResetToken();
      const expiresAt = new Date(Date.now() + tokenTtlSeconds * 1000);
      await userRepository.setResetToken(user.id, tokenHash, expiresAt);

      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
      // Not awaited — best-effort, and the response must not reveal whether
      // the account existed (same shape/timing either way).
      emailSender.send(passwordResetEmail(user, resetUrl));
    }

    // Always the same response, whether or not the account exists — avoids
    // leaking account existence via response shape.
    return { ok: true };
  };
}

module.exports = makeRequestPasswordReset;
