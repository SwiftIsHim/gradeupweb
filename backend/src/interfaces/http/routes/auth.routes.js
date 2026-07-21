const { Router } = require("express");

function makeAuthRoutes(controller) {
  const router = Router();

  // Step 1 — email screen
  router.post("/account-exists", controller.accountExists);
  // Step 2 — password login
  router.post("/login", controller.login);
  // Signup completion (phone OTP send/verify intentionally omitted)
  router.post("/signup", controller.signup);

  return router;
}

module.exports = makeAuthRoutes;
