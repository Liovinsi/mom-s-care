const express = require("express");
const controller = require("../controllers/dashboard.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, authorize("SUPER_ADMIN", "WARDEN"), controller.summary);

module.exports = router;
