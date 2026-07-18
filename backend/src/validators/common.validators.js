const { body, param } = require("express-validator");

const mongoId = (field = "id") => param(field).isMongoId().withMessage(`${field} must be a valid Mongo id.`);

const loginRules = [
  body("loginId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Login ID / Email is required."),
  body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Login ID / Email is required."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
];

const socialRules = [
  body("providerId").notEmpty().withMessage("Provider id is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("name").notEmpty().withMessage("Name is required.")
];

const bookingRules = [
  body("branch").isMongoId(),
  body("room").isMongoId(),
  body("bed").isMongoId(),
  body("moveInDate").isISO8601().withMessage("Move-in date is required.")
];

module.exports = { mongoId, loginRules, socialRules, bookingRules };
