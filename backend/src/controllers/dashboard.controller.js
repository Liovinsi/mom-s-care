const Bed = require("../models/Bed");
const Booking = require("../models/Booking");
const Branch = require("../models/Branch");
const Payment = require("../models/Payment");
const Resident = require("../models/Resident");
const catchAsync = require("../utils/catchAsync");

const summary = catchAsync(async (req, res) => {
  const branchFilter = req.user.role === "WARDEN" && req.user.branch ? { branch: req.user.branch } : {};
  const [branches, beds, bookedBeds, residents, pendingBookings, revenue] = await Promise.all([
    Branch.countDocuments(req.user.role === "WARDEN" ? { _id: req.user.branch } : {}),
    Bed.countDocuments(branchFilter),
    Bed.countDocuments({ ...branchFilter, status: "OCCUPIED" }),
    Resident.countDocuments({ ...branchFilter, status: "ACTIVE" }),
    Booking.countDocuments({ ...branchFilter, status: { $in: ["BLOCKED", "PENDING_APPROVAL"] } }),
    Payment.aggregate([
      { $match: { ...branchFilter, status: { $in: ["PAID", "PARTIAL"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      branches,
      totalBeds: beds,
      bookedBeds,
      occupancyRate: beds ? Math.round((bookedBeds / beds) * 100) : 0,
      activeResidents: residents,
      pendingBookings,
      revenue: revenue[0]?.total || 0
    }
  });
});

module.exports = { summary };
