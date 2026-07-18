const express = require("express");
const controller = require("../controllers/warden.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");
const { mongoId } = require("../validators/common.validators");

const router = express.Router();

router.use(authenticate, authorize("SUPER_ADMIN"));
router.get("/", controller.list);
router.post("/", controller.create);
router.patch("/:id", mongoId(), validate, controller.update);
router.delete("/:id", mongoId(), validate, controller.remove);

module.exports = router;
