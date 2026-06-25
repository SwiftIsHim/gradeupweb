const { Router } = require("express");
const requireAuth = require("../middleware/requireAuth");
const controller = require("../controllers/progress.controller");

const router = Router();

// All progress routes require a signed-in user (progress is per-user).
router.use(requireAuth);

router.get("/", controller.list);
router.get("/:slug", controller.detail);
router.post("/:slug/chapters/:chapter/complete", controller.complete);
router.post("/:slug/chapters/:chapter/quiz", controller.submitQuiz);

module.exports = router;
