const Bed = require("../models/Bed");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const catchAsync = require("../utils/catchAsync");

const occupancy = catchAsync(async (req, res) => {
  const match = req.query.branch ? { branch: req.query.branch } : {};
  const data = await Bed.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  res.json({ success: true, data });
});

const bookings = catchAsync(async (_req, res) => {
  const data = await Booking.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.json({ success: true, data });
});

const payments = catchAsync(async (_req, res) => {
  const data = await Payment.aggregate([
    { $group: { _id: "$status", amount: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);
  res.json({ success: true, data });
});

module.exports = { occupancy, bookings, payments };
