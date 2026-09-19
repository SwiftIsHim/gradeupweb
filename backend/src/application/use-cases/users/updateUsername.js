const User = require("../../../domain/entities/User");
const { ConflictError } = require("../../../domain/errors");

/** @param {{ userRepository: import("../../../domain/ports").UserRepository }} deps */
function makeUpdateUsername({ userRepository }) {
  return async function updateUsername(userId, rawUsername) {
    const username = String(rawUsername || "").trim().toLowerCase();
    // Reuses User's format validation without needing a full entity in hand.
    new User({ id: userId }).assignUsername(username);

    const existing = await userRepository.findByUsername(username);
    if (existing && String(existing.id) !== String(userId)) {
      throw new ConflictError("That username is already taken.");
    }

    // The repository translates the unique-index race into ConflictError too.
    return userRepository.updateUsername(userId, username);
  };
}

module.exports = makeUpdateUsername;
