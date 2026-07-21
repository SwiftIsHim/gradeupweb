const { assertValidEmail } = require("../../../domain/valueObjects/Email");

/** @param {{ userRepository: import("../../../domain/ports").UserRepository }} deps */
function makeCheckAccountExists({ userRepository }) {
  /** Step 1 — does an account exist for this email? */
  return async function checkAccountExists(rawEmail) {
    const email = assertValidEmail(rawEmail);
    const user = await userRepository.findByEmail(email);
    return { exists: Boolean(user), login_hint: user ? user.loginHint : null };
  };
}

module.exports = makeCheckAccountExists;
