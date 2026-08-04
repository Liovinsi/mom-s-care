const Resident = require("../models/Resident");
const catchAsync = require("../utils/catchAsync");
const createCrudController = require("./crudFactory");
const ApiError = require("../utils/apiError");

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

const get = catchAsync(async (req, res) => {
  const resident = await Resident.findById(req.params.id).populate("user booking branch room bed");
  if (!resident) throw new ApiError(404, "Resident not found.");
  if (req.user.role === "WARDEN" && (!req.user.branch || resident.branch._id.toString() !== req.user.branch.toString())) {
    throw new ApiError(403, "Wardens can access residents only in their assigned branch.");
  }
  res.json({ success: true, data: resident });
});

const update = catchAsync(async (req, res) => {
  const resident = await Resident.findById(req.params.id);
  if (!resident) throw new ApiError(404, "Resident not found.");
  if (req.user.role === "WARDEN" && (!req.user.branch || resident.branch.toString() !== req.user.branch.toString())) {
    throw new ApiError(403, "Wardens can update residents only in their assigned branch.");
  }

  const payload = { ...req.body };
  if (req.user.role === "WARDEN") {
    delete payload.branch;
    delete payload.room;
    delete payload.bed;
    delete payload.user;
    delete payload.booking;
  }

  const updated = await Resident.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    .populate("user booking branch room bed");
  res.json({ success: true, data: updated });
});

module.exports = { ...crud, list, get, update };
