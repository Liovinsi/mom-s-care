const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    mapLink: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    description: { type: String },
    amenities: [{ type: String }],
    images: [{ type: String }],
    warden: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", branchSchema);
