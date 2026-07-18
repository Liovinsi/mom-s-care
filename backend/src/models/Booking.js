const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    bed: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true },
    moveInDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING_PAYMENT"
    },
    tokenAmount: { type: Number, required: true },
    notes: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
