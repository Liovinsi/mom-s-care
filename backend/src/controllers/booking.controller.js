const mongoose = require("mongoose");
const Bed = require("../models/Bed");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Resident = require("../models/Resident");
const Room = require("../models/Room");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const { emitBedAvailability, emitBookingBlocked, emitPaymentUpdate } = require("../services/socket.service");

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
  const { branch, room, bed, moveInDate, notes, guestName, guestPhone, mobileNumber } = req.body;
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
          guestName: guestName || req.user.name,
          guestPhone: guestPhone || mobileNumber || req.user.phone,
          moveInDate,
          notes,
          tokenAmount: roomDoc.tokenAmount,
          status: "BLOCKED"
        }
      ],
      { session }
    );

    emitBedAvailability(selectedBed);
    emitBookingBlocked(booking[0]);
  });

  session.endSession();
  res.status(201).json({ success: true, data: booking[0] });
});

const createDirect = catchAsync(async (req, res) => {
  const { branch, room, bed, moveInDate, notes, guestName, guestPhone, guestEmail, source = "WALK_IN" } = req.body;
  if (!guestName || !guestPhone) throw new ApiError(422, "Guest name and mobile number are required.");

  const session = await mongoose.startSession();
  let booking;

  await session.withTransaction(async () => {
    const selectedBed = await Bed.findOne({ _id: bed, room, branch }).session(session);
    if (!selectedBed || selectedBed.status !== "AVAILABLE") {
      throw new ApiError(409, "Selected bed is not available.");
    }

    const roomDoc = await Room.findById(room).session(session);
    if (!roomDoc) throw new ApiError(404, "Room not found.");

    const email = String(guestEmail || `walkin-${Date.now()}@pgstay.local`).toLowerCase();
    let guest = await User.findOne({ email }).session(session);
    if (!guest) {
      guest = await User.create(
        [
          {
            name: guestName,
            email,
            phone: guestPhone,
            role: "GUEST",
            provider: "local"
          }
        ],
        { session }
      ).then(([user]) => user);
    }

    selectedBed.status = "RESERVED";
    selectedBed.holdExpiresAt = undefined;
    await selectedBed.save({ session });

    booking = await Booking.create(
      [
        {
          guest: guest._id,
          branch,
          room,
          bed,
          guestName,
          guestPhone,
          source: source === "PHONE" ? "PHONE" : "WALK_IN",
          moveInDate,
          notes,
          tokenAmount: roomDoc.tokenAmount,
          status: "BLOCKED"
        }
      ],
      { session }
    );

    emitBedAvailability(selectedBed);
    emitBookingBlocked(booking[0]);
  });

  session.endSession();
  res.status(201).json({ success: true, data: booking[0] });
});

const approve = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found.");
  if (!["BLOCKED", "PENDING_APPROVAL"].includes(booking.status)) throw new ApiError(409, "Booking is not pending approval.");

  const amountReceived = Number(req.body.amount || req.body.amountReceived || booking.tokenAmount || 0);
  if (!amountReceived || amountReceived <= 0) throw new ApiError(422, "Amount received is required for manual confirmation.");

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

  const payment = await Payment.create({
    booking: booking._id,
    guest: booking.guest,
    branch: booking.branch,
    amount: amountReceived,
    type: req.body.paymentType || "TOKEN",
    status: "PAID",
    method: req.body.method || "CASH",
    reference: req.body.reference || req.body.referenceNumber,
    receiptNumber: req.body.receiptNumber,
    collectedBy: req.user._id,
    collectedByName: req.user.name,
    paidAt: req.body.paidAt ? new Date(req.body.paidAt) : new Date()
  });
  emitPaymentUpdate(payment);

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

module.exports = { list, create, createDirect, approve, reject };
