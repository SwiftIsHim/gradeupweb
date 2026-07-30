const { Router } = require("express");

const makeAuthRoutes = require("./auth.routes");
const makeOnboardingRoutes = require("./onboarding.routes");
const makeProgressRoutes = require("./progress.routes");
const makeAttemptRoutes = require("./attempt.routes");

/**
 * @param {{
 *   authController: object,
 *   onboardingController: object,
 *   progressController: object,
 *   testAttemptController: object,
 *   diagnosticAttemptController: object,
 *   requireAuth: import("express").RequestHandler,
 * }} controllers
 */
function makeRoutes({
  authController,
  onboardingController,
  progressController,
  testAttemptController,
  diagnosticAttemptController,
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

  return router;
}

module.exports = makeRoutes;
