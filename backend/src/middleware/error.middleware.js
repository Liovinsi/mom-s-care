const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new ApiError(422, "Validation failed.", result.array()));
  }
  next();
};

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error." : err.message;

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || []
  });
};

module.exports = { validate, notFound, errorHandler };
