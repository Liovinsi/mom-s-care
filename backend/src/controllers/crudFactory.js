const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");

const pickQuery = (req, allowed) =>
  allowed.reduce((acc, key) => {
    if (req.query[key] !== undefined) acc[key] = req.query[key];
    return acc;
  }, {});

const createCrudController = (Model, options = {}) => ({
  list: catchAsync(async (req, res) => {
    const filter = pickQuery(req, options.filterFields || []);
    const data = await Model.find(filter).populate(options.populate || "").sort({ createdAt: -1 });
    res.json({ success: true, data });
  }),

  get: catchAsync(async (req, res) => {
    const doc = await Model.findById(req.params.id).populate(options.populate || "");
    if (!doc) throw new ApiError(404, `${Model.modelName} not found.`);
    res.json({ success: true, data: doc });
  }),

  create: catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  }),

  update: catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) throw new ApiError(404, `${Model.modelName} not found.`);
    res.json({ success: true, data: doc });
  }),

  remove: catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, `${Model.modelName} not found.`);
    res.json({ success: true, data: { id: req.params.id } });
  })
});

module.exports = createCrudController;
