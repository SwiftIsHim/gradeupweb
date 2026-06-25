const { Router } = require("express");
const requireAuth = require("../middleware/requireAuth");
const controller = require("../controllers/testAttempt.controller");

const router = Router();

// All attempt routes require a signed-in user (attempts are per-user).
router.use(requireAuth);

router.get("/", controller.list);
router.get("/:slug", controller.listForTest);
router.post("/:slug", controller.create);

module.exports = router;
