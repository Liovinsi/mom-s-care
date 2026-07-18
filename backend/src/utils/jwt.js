const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      employeeId: user.employeeId,
      branchId: user.branch?.toString()
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

module.exports = { signToken };
