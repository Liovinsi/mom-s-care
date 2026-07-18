const express = require("express");
const controller = require("../controllers/room.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");
const { mongoId } = require("../validators/common.validators");

const router = express.Router();

router.get("/", controller.list);
router.get("/:id", mongoId(), validate, controller.get);
router.use(authenticate, authorize("SUPER_ADMIN"));
router.post("/", controller.create);
router.patch("/:id", mongoId(), validate, controller.update);
router.delete("/:id", mongoId(), validate, controller.remove);

module.exports = router;
