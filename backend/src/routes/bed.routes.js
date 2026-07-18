const express = require("express");
const controller = require("../controllers/bed.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/error.middleware");
const { mongoId } = require("../validators/common.validators");

const router = express.Router();

router.get("/", controller.list);
router.get("/:id", mongoId(), validate, controller.get);
router.use(authenticate, authorize("SUPER_ADMIN", "WARDEN"));
router.post("/", authorize("SUPER_ADMIN"), controller.create);
router.patch("/:id", mongoId(), validate, controller.update);
router.delete("/:id", mongoId(), validate, authorize("SUPER_ADMIN"), controller.remove);

module.exports = router;
