const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  action: { type: String, required: true },
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  byName: String,
  reason: String,
  oldStatus: String,
  newStatus: String,
  at: { type: Date, default: Date.now }
}, { _id: false });

const statusUpdateRequestSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true },
  currentStatus: { type: String, required: true },
  requestedStatus: { type: String, enum: ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"], required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requestedByName: { type: String, required: true },
  status: { type: String, enum: ["PENDING_APPROVAL", "APPROVED", "REJECTED"], default: "PENDING_APPROVAL", index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: Date,
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rejectedAt: Date,
  rejectionReason: String,
  history: [historySchema]
}, { timestamps: true });

module.exports = mongoose.model("StatusUpdateRequest", statusUpdateRequestSchema);
