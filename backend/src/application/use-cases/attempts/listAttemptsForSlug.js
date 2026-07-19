/** @param {{ attemptRepository: import("../../../domain/ports").AttemptRepository }} deps */
function makeListAttemptsForSlug({ attemptRepository }) {
  return async function listAttemptsForSlug(userId, slug) {
    return attemptRepository.listByUserAndSlug(userId, slug);
  };
}

module.exports = makeListAttemptsForSlug;
