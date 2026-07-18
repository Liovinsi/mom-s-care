const connectDB = require("../config/db");
const env = require("../config/env");
const User = require("../models/User");

const seed = async () => {
  await connectDB();

  const existing = await User.findOne({ email: env.superAdmin.email.toLowerCase() });
  if (existing) {
    console.log(`[seed] Super Admin already exists: ${existing.email}`);
    process.exit(0);
  }

  const user = await User.create({
    name: env.superAdmin.name,
    email: env.superAdmin.email,
    password: env.superAdmin.password,
    role: "SUPER_ADMIN",
    provider: "local"
  });

  console.log(`[seed] Super Admin created: ${user.email}`);
  process.exit(0);
};

seed().catch((error) => {
  console.error("[seed] Failed", error);
  process.exit(1);
});
