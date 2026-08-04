const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const { emitPaymentUpdate } = require("../services/socket.service");

const typeMap = {
  "Booking Token": "TOKEN",
  "Monthly Rent": "RENT",
  "Security Deposit": "DEPOSIT",
  "Electricity Charges": "ELECTRICITY",
  "Other Charges": "OTHER",
  Fine: "FINE",
  Refund: "REFUND"
};

const methodMap = {
  Cash: "CASH",
  UPI: "UPI",
  Card: "CARD",
  "Bank Transfer": "BANK_TRANSFER"
};

const statusMap = {
  Paid: "PAID",
  Pending: "PENDING",
  Overdue: "OVERDUE",
  Partial: "PARTIAL",
  Refunded: "REFUNDED"
};

const list = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user.role === "GUEST") filter.guest = req.user._id;
  if (req.user.role === "WARDEN" && req.user.branch) filter.branch = req.user.branch;
  if (req.user.role === "SUPER_ADMIN" && req.query.branch) filter.branch = req.query.branch;
  if (req.query.status) filter.status = req.query.status;

  const data = await Payment.find(filter).populate("booking guest branch").sort({ createdAt: -1 });
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  let requestedBranch = req.body.branch || req.body.branchId;
  let guest = req.body.guest;
  if (req.user.role === "GUEST") {
    const booking = await Booking.findOne({ _id: req.body.booking, guest: req.user._id });
    if (!booking) throw new ApiError(403, "You can only pay for your own booking.");
    requestedBranch = booking.branch;
    guest = req.user._id;
  }
  if (req.user.role === "WARDEN" && req.user.branch && requestedBranch && requestedBranch !== req.user.branch.toString()) {
    throw new ApiError(403, "Wardens can collect payments only for their assigned branch.");
  }

  const branch = req.user.role === "WARDEN" && req.user.branch ? req.user.branch : requestedBranch;
  if (!branch) throw new ApiError(422, "Branch is required.");

  const payment = await Payment.create({
    ...(req.body.booking ? { booking: req.body.booking } : {}),
    ...(guest ? { guest } : {}),
    branch,
    amount: Number(req.body.amount || 0),
    type: typeMap[req.body.paymentType] || req.body.type || "RENT",
    status: statusMap[req.body.paymentStatus] || req.body.status || "PAID",
    method: methodMap[req.body.paymentMethod] || req.body.method || "CASH",
    reference: req.body.reference || req.body.transactionId || req.body.referenceNumber,
    receiptNumber: req.body.receiptNo || req.body.receiptNumber,
    ...(req.user.role !== "GUEST" ? { collectedBy: req.user._id, collectedByName: req.user.name } : {}),
    month: req.body.month,
    rent: Number(req.body.rent || 0),
    deposit: Number(req.body.deposit || 0),
    otherCharges: Number(req.body.otherCharges || 0),
    paidAt: req.body.paymentStatus === "Paid" || req.body.status === "PAID" ? new Date() : undefined
  });

  emitPaymentUpdate(payment);
  res.status(201).json({ success: true, data: payment });
});

const markPaid = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, "Payment not found.");
  if (req.user.role === "GUEST" && (!payment.guest || payment.guest.toString() !== req.user._id.toString())) {
    throw new ApiError(403, "You cannot update another guest payment.");
  }
  if (req.user.role === "WARDEN" && req.user.branch && payment.branch.toString() !== req.user.branch.toString()) {
    throw new ApiError(403, "You cannot update payment outside your branch.");
  }

  payment.status = "PAID";
  payment.method = req.body.method || payment.method;
  payment.reference = req.body.reference || `MOCK-${Date.now()}`;
  payment.paidAt = new Date();
  await payment.save();
  emitPaymentUpdate(payment);

  const booking = await Booking.findById(payment.booking);
  if (booking && booking.status === "PENDING_PAYMENT") {
    booking.status = "PENDING_APPROVAL";
    await booking.save();
  }

  res.json({ success: true, data: payment });
});

module.exports = { list, create, markPaid };
