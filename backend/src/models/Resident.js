const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    bed: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true },
    moveInDate: { type: Date, required: true },
    moveOutDate: { type: Date },
    status: { type: String, enum: ["ACTIVE", "NOTICE", "MOVED_OUT"], default: "ACTIVE" },
    emergencyContact: {
      name: String,
      phone: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resident", residentSchema);
