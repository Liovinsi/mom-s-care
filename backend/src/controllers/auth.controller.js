const User = require("../models/User");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const { signToken } = require("../utils/jwt");

const sendAuth = (res, user) => {
  const redirectByRole = {
    SUPER_ADMIN: "/pgbooking/admin/dashboard",
    WARDEN: "/pgbooking/warden/dashboard",
    GUEST: "/pgbooking/user/dashboard"
  };

  res.json({
    success: true,
    role: user.role,
    redirect: redirectByRole[user.role],
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      branch: user.branch,
      branchId: user.branch,
      avatarUrl: user.avatarUrl
    }
  });
};

const login = catchAsync(async (req, res) => {
  const loginId = String(req.body.loginId || req.body.email || "").trim();
  const { password } = req.body;

  console.log("[auth] Login ID received:", loginId);

  if (!loginId) {
    throw new ApiError(422, "Login ID / Email is required.");
  }

  const isWardenLogin = loginId.toUpperCase().startsWith("WD");
  const isEmailLogin = loginId.includes("@");

  if (!isWardenLogin && !isEmailLogin) {
    throw new ApiError(422, "Enter a valid email or Warden Employee ID.");
  }

  const user = isWardenLogin
    ? await User.findOne({ employeeId: loginId.toUpperCase() }).select("+password")
    : await User.findOne({ email: loginId.toLowerCase() }).select("+password");

  console.log("[auth] Warden found:", isWardenLogin ? Boolean(user) : "not warden login");
  console.log("[auth] Role:", user?.role || "not found");
  console.log("[auth] Status:", user?.status || (user?.isActive ? "Active" : "Inactive"));

  if (isWardenLogin && !user) {
    throw new ApiError(401, "Warden ID not found.");
  }

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (isWardenLogin && user.role !== "WARDEN") {
    throw new ApiError(403, "Invalid warden role.");
  }

  const active = user.status ? user.status === "Active" : user.isActive;
  if (!active || !user.isActive) {
    throw new ApiError(403, isWardenLogin ? "Account is inactive." : "Invalid email or password.");
  }

  const valid = await user.comparePassword(password);
  console.log("[auth] Password matched:", valid);

  if (!valid) {
    throw new ApiError(401, isWardenLogin ? "Incorrect password." : "Invalid email or password.");
  }

  sendAuth(res, user);
});

const socialLogin = (provider) =>
  catchAsync(async (req, res) => {
    const { providerId, email, name, avatarUrl } = req.body;

    if (!providerId || !email || !name) {
      throw new ApiError(422, "Provider id, email and name are required.");
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name,
        email: normalizedEmail,
        provider,
        providerId,
        avatarUrl,
        role: "GUEST"
      });
    } else if (user.role !== "GUEST") {
      throw new ApiError(403, "This account is not allowed for guest social login.");
    }

    sendAuth(res, user);
  });

const me = catchAsync(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = {
  login,
  googleLogin: socialLogin("google"),
  facebookLogin: socialLogin("facebook"),
  me
};
