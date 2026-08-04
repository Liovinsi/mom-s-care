const Bed = require("../models/Bed");
const Booking = require("../models/Booking");
const Resident = require("../models/Resident");
const StatusUpdateRequest = require("../models/StatusUpdateRequest");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const { emitBedAvailability, emitStatusUpdateRequest } = require("../services/socket.service");

const allowedStatuses = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"];

const list = catchAsync(async (req, res) => {
  const filter = req.user.role === "WARDEN" ? { branch: req.user.branch, requestedBy: req.user._id } : {};
  if (req.query.status) filter.status = req.query.status;
  const data = await StatusUpdateRequest.find(filter).populate("branch room bed requestedBy approvedBy rejectedBy").sort({ createdAt: -1 });
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  if (!req.user.branch) throw new ApiError(403, "Warden does not have an assigned branch.");
  const requestedStatus = String(req.body.requestedStatus || "").toUpperCase();
  if (!allowedStatuses.includes(requestedStatus)) throw new ApiError(422, "Invalid requested bed status.");

  const bed = await Bed.findById(req.body.bed);
  if (!bed) throw new ApiError(404, "Bed not found.");
  if (bed.branch.toString() !== req.user.branch.toString()) throw new ApiError(403, "Wardens can request changes only for their assigned branch.");
  if (bed.status === requestedStatus) throw new ApiError(409, "Requested status is already active.");

  const request = await StatusUpdateRequest.create({
    branch: bed.branch,
    room: bed.room,
    bed: bed._id,
    currentStatus: bed.status,
    requestedStatus,
    requestedBy: req.user._id,
    requestedByName: req.user.name,
    history: [{ action: "REQUESTED", by: req.user._id, byName: req.user.name, oldStatus: bed.status, newStatus: requestedStatus }]
  });
  emitStatusUpdateRequest(request);
  res.status(201).json({ success: true, data: request });
});

const approve = catchAsync(async (req, res) => {
  const request = await StatusUpdateRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Update request not found.");
  if (request.status !== "PENDING_APPROVAL") throw new ApiError(409, "This request has already been reviewed.");
  const bed = await Bed.findById(request.bed);
  if (!bed) throw new ApiError(404, "Bed not found.");
  if (bed.status !== request.currentStatus) throw new ApiError(409, "Live status changed after this request was submitted.");

  bed.status = request.requestedStatus;
  if (bed.status === "AVAILABLE") {
    bed.currentResident = undefined;
    await Resident.updateMany({ bed: bed._id, status: { $ne: "MOVED_OUT" } }, { status: "MOVED_OUT", moveOutDate: new Date() });
    await Booking.updateMany({ bed: bed._id, status: "CHECKED_IN" }, { status: "COMPLETED" });
  }
  await bed.save();

  request.status = "APPROVED";
  request.approvedBy = req.user._id;
  request.approvedAt = new Date();
  request.history.push({ action: "APPROVED", by: req.user._id, byName: req.user.name, oldStatus: request.currentStatus, newStatus: request.requestedStatus });
  await request.save();
  emitBedAvailability(bed);
  emitStatusUpdateRequest(request);
  res.json({ success: true, data: request });
});

const reject = catchAsync(async (req, res) => {
  const request = await StatusUpdateRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Update request not found.");
  if (request.status !== "PENDING_APPROVAL") throw new ApiError(409, "This request has already been reviewed.");
  if (!String(req.body.reason || "").trim()) throw new ApiError(422, "Rejection reason is required.");
  request.status = "REJECTED";
  request.rejectedBy = req.user._id;
  request.rejectedAt = new Date();
  request.rejectionReason = req.body.reason.trim();
  request.history.push({ action: "REJECTED", by: req.user._id, byName: req.user.name, reason: request.rejectionReason, oldStatus: request.currentStatus, newStatus: request.requestedStatus });
  await request.save();
  emitStatusUpdateRequest(request);
  res.json({ success: true, data: request });
});

module.exports = { list, create, approve, reject };
