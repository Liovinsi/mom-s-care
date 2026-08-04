const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    label: { type: String, required: true, trim: true },
    bedType: { type: String, enum: ["Single Cot", "Bunk Cot"], default: "Single Cot" },
    bunkPosition: { type: String, enum: ["Upper", "Lower"], required: function requireBunkPosition() { return this.bedType === "Bunk Cot"; } },
    position: { row: Number, col: Number },
    status: {
      type: String,
      enum: ["AVAILABLE", "BLOCKED", "OCCUPIED", "RESERVED", "MAINTENANCE"],
      default: "AVAILABLE"
    },
    currentResident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident" },
    holdExpiresAt: { type: Date }
  },
  { timestamps: true }
);

bedSchema.index({ room: 1, label: 1 }, { unique: true });

module.exports = mongoose.model("Bed", bedSchema);
