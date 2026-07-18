const mongoose = require("mongoose");
const Bed = require("../models/Bed");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Resident = require("../models/Resident");
const Room = require("../models/Room");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const { emitBedAvailability } = require("../services/socket.service");

const list = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user.role === "GUEST") filter.guest = req.user._id;
  if (req.user.role === "WARDEN" && req.user.branch) filter.branch = req.user.branch;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.branch && req.user.role === "SUPER_ADMIN") filter.branch = req.query.branch;

  const data = await Booking.find(filter)
    .populate("guest branch room bed approvedBy")
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const { branch, room, bed, moveInDate, notes } = req.body;
  const session = await mongoose.startSession();

  let booking;
  await session.withTransaction(async () => {
    const selectedBed = await Bed.findOne({ _id: bed, room, branch }).session(session);
    if (!selectedBed || selectedBed.status !== "AVAILABLE") {
      throw new ApiError(409, "Selected bed is not available.");
    }

    const roomDoc = await Room.findById(room).session(session);
    if (!roomDoc) throw new ApiError(404, "Room not found.");

    selectedBed.status = "RESERVED";
    selectedBed.holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await selectedBed.save({ session });

    booking = await Booking.create(
      [
        {
          guest: req.user._id,
          branch,
          room,
          bed,
          moveInDate,
          notes,
          tokenAmount: roomDoc.tokenAmount,
          status: "PENDING_PAYMENT"
        }
      ],
      { session }
    );

    await Payment.create(
      [
        {
          booking: booking[0]._id,
          guest: req.user._id,
          branch,
          amount: roomDoc.tokenAmount,
          type: "TOKEN",
          status: "PENDING"
        }
      ],
      { session }
    );

    emitBedAvailability(selectedBed);
  });

  session.endSession();
  res.status(201).json({ success: true, data: booking[0] });
});

const approve = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found.");
  if (booking.status !== "PENDING_APPROVAL") throw new ApiError(409, "Booking is not pending approval.");

  const bed = await Bed.findById(booking.bed);
  if (!bed || !["RESERVED", "AVAILABLE"].includes(bed.status)) throw new ApiError(409, "Bed cannot be approved.");

  booking.status = "APPROVED";
  booking.approvedBy = req.user._id;
  booking.approvedAt = new Date();
  bed.status = "RESERVED";
  bed.holdExpiresAt = undefined;

  const resident = await Resident.create({
    user: booking.guest,
    booking: booking._id,
    branch: booking.branch,
    room: booking.room,
    bed: booking.bed,
    moveInDate: booking.moveInDate
  });

  bed.currentResident = resident._id;
  await booking.save();
  await bed.save();
  emitBedAvailability(bed);

  res.json({ success: true, data: booking });
});

const reject = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found.");

  const bed = await Bed.findById(booking.bed);
  booking.status = "REJECTED";
  booking.rejectionReason = req.body.reason || "Rejected by Super Admin";
  if (bed && bed.status !== "OCCUPIED") {
    bed.status = "AVAILABLE";
    bed.holdExpiresAt = undefined;
    await bed.save();
    emitBedAvailability(bed);
  }
  await booking.save();

  res.json({ success: true, data: booking });
});

module.exports = { list, create, approve, reject };
