const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    employeeId: { type: String, uppercase: true, trim: true, unique: true, sparse: true },
    password: { type: String, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["SUPER_ADMIN", "WARDEN", "GUEST"], required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    provider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
    providerId: { type: String },
    avatarUrl: { type: String },
    status: { type: String, enum: ["Active", "Inactive", "On Leave"], default: "Active" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
