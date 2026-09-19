const { Router } = require("express");

function makePostsRoutes(controller, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.post("/", controller.create);
  router.delete("/:id", controller.remove);
  router.post("/:id/react", controller.react);
  router.get("/:id/comments", controller.comments);
  router.post("/:id/comments", controller.addComment);

  return router;
}

module.exports = makePostsRoutes;
