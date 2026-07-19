const { Router } = require("express");

function makeOnboardingRoutes(controller, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.get("/", controller.get);
  router.post("/", controller.save);

  return router;
}

module.exports = makeOnboardingRoutes;
