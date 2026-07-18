const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");

const authenticate = catchAsync(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) throw new ApiError(401, "Authentication token is required.");

  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) throw new ApiError(401, "Invalid or inactive user.");
  req.user = user;
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to access this resource."));
  }
  next();
};

module.exports = { authenticate, authorize };
