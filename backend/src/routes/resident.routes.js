const express = require("express");
const controller = require("../controllers/resident.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");
const { mongoId } = require("../validators/common.validators");

const router = express.Router();

router.use(authenticate, authorize("SUPER_ADMIN", "WARDEN"));
router.get("/", controller.list);
router.get("/:id", mongoId(), validate, controller.get);
router.patch("/:id", mongoId(), validate, controller.update);

module.exports = router;
