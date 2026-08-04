const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    bed: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true },
    guestName: { type: String, trim: true },
    guestPhone: { type: String, trim: true },
    source: { type: String, enum: ["ONLINE", "WALK_IN", "PHONE"], default: "ONLINE" },
    moveInDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["BLOCKED", "PENDING_PAYMENT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING_APPROVAL"
    },
    tokenAmount: { type: Number, required: true },
    blockedAt: { type: Date },
    holdExpiresAt: { type: Date },
    notes: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
