const express = require("express");
const roomController = require("../controllers/room.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate, authorize("SUPER_ADMIN"));
router.get("/rooms", roomController.listForAdmin);

module.exports = router;
