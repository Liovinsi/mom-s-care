const dotenv = require("dotenv");

dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET"];

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[config] Missing ${key}. Add it to backend/.env before running in production.`);
  }
});

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pg_booking_platform",
  jwtSecret: process.env.JWT_SECRET || "dev_only_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME || "Super Admin",
    email: process.env.SUPER_ADMIN_EMAIL || "admin@pg.local",
    password: process.env.SUPER_ADMIN_PASSWORD || "Admin@12345"
  },
  oauth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    facebookAppId: process.env.FACEBOOK_APP_ID,
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET
  }
};
