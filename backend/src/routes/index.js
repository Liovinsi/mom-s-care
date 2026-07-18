const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok", service: "pg-booking-platform-api" });
});

router.use("/auth", require("./auth.routes"));
router.use("/branches", require("./branch.routes"));
router.use("/rooms", require("./room.routes"));
router.use("/beds", require("./bed.routes"));
router.use("/bookings", require("./booking.routes"));
router.use("/payments", require("./payment.routes"));
router.use("/residents", require("./resident.routes"));
router.use("/wardens", require("./warden.routes"));
router.use("/dashboard", require("./dashboard.routes"));
router.use("/reports", require("./report.routes"));

module.exports = router;
