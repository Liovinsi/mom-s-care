const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log(`[db] MongoDB connected: ${mongoose.connection.name}`);
};

module.exports = connectDB;
