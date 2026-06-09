const mongoose = require("mongoose");
const config = require("./env");

/** Connect to MongoDB. Call once at startup before the server listens. */
async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongoUri);
  console.log(`MongoDB connected [${mongoose.connection.name}]`);
  return mongoose.connection;
}

module.exports = { connectDb };
