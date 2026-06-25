const { Router } = require("express");
const requireAuth = require("../middleware/requireAuth");
const controller = require("../controllers/onboarding.controller");

const router = Router();

// Read / save (upsert) the signed-in user's onboarding answers.
router.get("/", requireAuth, controller.get);
router.post("/", requireAuth, controller.save);

module.exports = router;
