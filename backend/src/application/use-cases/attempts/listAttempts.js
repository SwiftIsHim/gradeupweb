/** @param {{ attemptRepository: import("../../../domain/ports").AttemptRepository }} deps */
function makeListAttempts({ attemptRepository }) {
  return async function listAttempts(userId) {
    return attemptRepository.listByUser(userId);
  };
}

module.exports = makeListAttempts;
