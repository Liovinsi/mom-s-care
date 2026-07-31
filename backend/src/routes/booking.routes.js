const express = require("express");
const controller = require("../controllers/booking.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");
const { bookingRules, mongoId } = require("../validators/common.validators");

const router = express.Router();

router.use(authenticate);
router.get("/", controller.list);
router.post("/", authorize("GUEST"), bookingRules, validate, controller.create);
router.post("/direct", authorize("SUPER_ADMIN"), controller.createDirect);
router.patch("/:id/approve", authorize("SUPER_ADMIN"), mongoId(), validate, controller.approve);
router.patch("/:id/reject", authorize("SUPER_ADMIN"), mongoId(), validate, controller.reject);

module.exports = router;
