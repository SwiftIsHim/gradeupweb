const { Router } = require("express");
const authRoutes = require("./auth.routes");
const onboardingRoutes = require("./onboarding.routes");
const progressRoutes = require("./progress.routes");
const testAttemptRoutes = require("./testAttempt.routes");

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/progress", progressRoutes);
router.use("/test-attempts", testAttemptRoutes);

module.exports = router;
