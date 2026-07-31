const Room = require("../models/Room");
const createCrudController = require("./crudFactory");

module.exports = createCrudController(Room, { populate: "branch", filterFields: ["branch", "sharingType", "roomType", "isActive"] });
