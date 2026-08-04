const express = require("express");
const controller = require("../controllers/statusUpdateRequest.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { mongoId } = require("../validators/common.validators");
const { validate } = require("../middleware/error.middleware");

const router = express.Router();
router.use(authenticate);
router.get("/", authorize("SUPER_ADMIN", "WARDEN"), controller.list);
router.post("/", authorize("WARDEN"), controller.create);
router.patch("/:id/approve", authorize("SUPER_ADMIN"), mongoId(), validate, controller.approve);
router.patch("/:id/reject", authorize("SUPER_ADMIN"), mongoId(), validate, controller.reject);

module.exports = router;
