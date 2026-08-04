const Room = require("../models/Room");
const Branch = require("../models/Branch");
const createCrudController = require("./crudFactory");
const catchAsync = require("../utils/catchAsync");

const controller = createCrudController(Room, { populate: "branch", filterFields: ["branch", "sharingType", "roomType", "isActive"] });

controller.listForAdmin = catchAsync(async (req, res) => {
  const branchValue = String(req.query.branch || "").trim();
  const filter = { isActive: true };

  if (branchValue) {
    const branch = await Branch.findOne({
      $or: [
        { name: { $regex: branchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { code: branchValue.toUpperCase() }
      ]
    });
    if (!branch) return res.json({ success: true, data: [] });
    filter.branch = branch._id;
  }

  const data = await Room.find(filter).populate("branch").sort({ floor: 1, name: 1 });
  return res.json({ success: true, data });
});

module.exports = controller;
