const { Router } = require("express");

function makeCommunitiesRoutes(controller, requireAuth) {
  const router = Router();
  router.use(requireAuth);

  router.get("/mine", controller.mine);
  router.get("/suggestions", controller.suggestions);
  router.get("/", controller.discover);
  router.post("/", controller.create);
  router.post("/:id/join", controller.join);
  router.post("/:id/leave", controller.leave);
  router.delete("/:id/members/:userId", controller.removeMember);

  return router;
}

module.exports = makeCommunitiesRoutes;
