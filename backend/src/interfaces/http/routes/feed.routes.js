const { Router } = require("express");

function makeFeedRoutes(controller, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.get("/", controller.get);

  return router;
}

module.exports = makeFeedRoutes;
