const User = require("../models/User");
const createCrudController = require("./crudFactory");
const catchAsync = require("../utils/catchAsync");

const crud = createCrudController(User, { filterFields: ["branch", "isActive"] });

const nextEmployeeId = async () => {
  const lastWarden = await User.findOne({ role: "WARDEN", employeeId: /^WD\d+$/ })
    .sort({ employeeId: -1 })
    .select("employeeId");
  const nextNumber = Number(lastWarden?.employeeId?.replace(/\D/g, "") || 0) + 1;
  return `WD${String(nextNumber).padStart(3, "0")}`;
};

const create = catchAsync(async (req, res) => {
  const employeeId = req.body.employeeId?.trim().toUpperCase() || await nextEmployeeId();
  const user = await User.create({
    ...req.body,
    employeeId,
    password: req.body.password || "Temp@123",
    role: "WARDEN",
    provider: "local",
    status: req.body.status || "Active",
    isActive: req.body.status ? req.body.status === "Active" : req.body.isActive !== false
  });
  res.status(201).json({ success: true, data: user });
});

const list = catchAsync(async (_req, res) => {
  const data = await User.find({ role: "WARDEN" }).populate("branch").sort({ createdAt: -1 });
  res.json({ success: true, data });
});

module.exports = { ...crud, create, list };
