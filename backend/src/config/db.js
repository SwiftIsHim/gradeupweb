const mongoose = require("mongoose");
const config = require("./env");

/** Connect to MongoDB. Call once at startup before the server listens. */
async function connectDb({ retries = 5, delayMs = 3000 } = {}) {
  mongoose.set("strictQuery", true);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(config.mongoUri);
      console.log(`MongoDB connected [${mongoose.connection.name}]`);
      return mongoose.connection;
    } catch (err) {
      // ESERVFAIL/ETIMEOUT on the SRV lookup are usually transient DNS blips
      // on flaky networks — retry rather than crashing the whole process.
      const isLast = attempt === retries;
      console.error(
        `MongoDB connect attempt ${attempt}/${retries} failed: ${err.code || err.message}`
      );
      if (isLast) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = { connectDb };
