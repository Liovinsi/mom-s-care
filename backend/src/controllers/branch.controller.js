const Branch = require("../models/Branch");
const createCrudController = require("./crudFactory");

module.exports = createCrudController(Branch, { populate: "warden", filterFields: ["city", "state", "isActive"] });
