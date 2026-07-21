/** @param {{ progressRepository: import("../../../domain/ports").ProgressRepository }} deps */
function makeListProgress({ progressRepository }) {
  return async function listProgress(userId) {
    return progressRepository.listByUser(userId);
  };
}

module.exports = makeListProgress;
