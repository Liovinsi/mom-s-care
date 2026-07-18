const express = require("express");
const controller = require("../controllers/report.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate, authorize("SUPER_ADMIN", "WARDEN"));
router.get("/occupancy", controller.occupancy);
router.get("/bookings", authorize("SUPER_ADMIN"), controller.bookings);
router.get("/payments", authorize("SUPER_ADMIN"), controller.payments);

module.exports = router;
