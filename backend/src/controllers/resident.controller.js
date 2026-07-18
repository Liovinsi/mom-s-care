const Resident = require("../models/Resident");
const catchAsync = require("../utils/catchAsync");
const createCrudController = require("./crudFactory");

const crud = createCrudController(Resident, {
  populate: "user booking branch room bed",
  filterFields: ["branch", "status"]
});

const list = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user.role === "WARDEN" && req.user.branch) filter.branch = req.user.branch;
  if (req.user.role === "SUPER_ADMIN" && req.query.branch) filter.branch = req.query.branch;
  if (req.query.status) filter.status = req.query.status;
  const data = await Resident.find(filter).populate("user booking branch room bed").sort({ createdAt: -1 });
  res.json({ success: true, data });
});

module.exports = { ...crud, list };
