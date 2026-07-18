const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    name: { type: String, required: true, trim: true },
    floor: { type: String, required: true },
    sharingType: { type: Number, required: true, min: 1 },
    monthlyRent: { type: Number, required: true, min: 0 },
    tokenAmount: { type: Number, required: true, min: 0 },
    amenities: [{ type: String }],
    images: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
