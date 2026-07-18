const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["TOKEN", "RENT", "DEPOSIT", "ELECTRICITY", "OTHER", "FINE", "REFUND"], default: "RENT" },
    status: { type: String, enum: ["PENDING", "PAID", "OVERDUE", "PARTIAL", "REFUNDED"], default: "PENDING" },
    method: { type: String, enum: ["UPI", "CARD", "CASH", "BANK_TRANSFER", "MOCK"], default: "MOCK" },
    reference: { type: String },
    receiptNumber: { type: String },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    collectedByName: { type: String },
    month: { type: String },
    rent: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
