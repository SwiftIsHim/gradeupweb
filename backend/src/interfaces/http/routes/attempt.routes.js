const { Router } = require("express");

/** Shared shape for /test-attempts and /diagnostic-attempts (mounted twice with different controllers). */
function makeAttemptRoutes(controller, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.get("/", controller.list);
  router.get("/:slug", controller.listForSlug);
  router.post("/:slug", controller.create);

  return router;
}

module.exports = makeAttemptRoutes;
