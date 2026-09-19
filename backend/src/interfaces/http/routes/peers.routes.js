const { Router } = require("express");

function makePeersRoutes(controller, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.get("/search", controller.search);
  router.get("/requests", controller.requests);
  router.post("/requests", controller.sendRequest);
  router.post("/requests/:id/accept", controller.accept);
  router.post("/requests/:id/decline", controller.decline);
  router.delete("/requests/:id", controller.cancel);
  router.get("/", controller.list);

  return router;
}

module.exports = makePeersRoutes;
