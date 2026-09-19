const { Router } = require("express");

const makeAuthRoutes = require("./auth.routes");
const makeOnboardingRoutes = require("./onboarding.routes");
const makeProgressRoutes = require("./progress.routes");
const makeAttemptRoutes = require("./attempt.routes");
const makeUserRoutes = require("./user.routes");
const makePeersRoutes = require("./peers.routes");
const makeCommunitiesRoutes = require("./communities.routes");

/**
 * @param {{
 *   authController: object,
 *   onboardingController: object,
 *   progressController: object,
 *   testAttemptController: object,
 *   diagnosticAttemptController: object,
 *   userController: object,
 *   peersController: object,
 *   communitiesController: object,
 *   requireAuth: import("express").RequestHandler,
 * }} controllers
 */
function makeRoutes({
  authController,
  onboardingController,
  progressController,
  testAttemptController,
  diagnosticAttemptController,
  userController,
  peersController,
  communitiesController,
  requireAuth,
}) {
  const router = Router();

  router.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  router.use("/auth", makeAuthRoutes(authController));
  router.use("/onboarding", makeOnboardingRoutes(onboardingController, requireAuth));
  router.use("/progress", makeProgressRoutes(progressController, requireAuth));
  router.use("/test-attempts", makeAttemptRoutes(testAttemptController, requireAuth));
  router.use("/diagnostic-attempts", makeAttemptRoutes(diagnosticAttemptController, requireAuth));
  router.use("/users", makeUserRoutes(userController, requireAuth));
  router.use("/peers", makePeersRoutes(peersController, requireAuth));
  router.use("/communities", makeCommunitiesRoutes(communitiesController, requireAuth));

  return router;
}

module.exports = makeRoutes;
