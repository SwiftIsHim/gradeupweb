const { Router } = require("express");

function makeUserRoutes(controller, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.get("/me", controller.getMe);
  router.patch("/me/username", controller.patchUsername);

  return router;
}

module.exports = makeUserRoutes;
