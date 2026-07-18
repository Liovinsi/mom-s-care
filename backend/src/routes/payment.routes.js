const express = require("express");
const controller = require("../controllers/payment.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");
const { mongoId } = require("../validators/common.validators");

const router = express.Router();

router.use(authenticate);
router.get("/", controller.list);
router.post("/", authorize("SUPER_ADMIN", "WARDEN"), controller.create);
router.patch("/:id/paid", authorize("SUPER_ADMIN", "WARDEN", "GUEST"), mongoId(), validate, controller.markPaid);

module.exports = router;
