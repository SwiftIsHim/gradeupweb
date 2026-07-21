const { Router } = require("express");

function makeProgressRoutes(controller, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.get("/", controller.list);
  router.get("/:slug", controller.detail);
  router.post("/:slug/chapters/:chapter/complete", controller.complete);
  router.post("/:slug/chapters/:chapter/quiz", controller.submitQuiz);

  return router;
}

module.exports = makeProgressRoutes;
