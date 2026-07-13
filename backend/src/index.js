const app = require("./app");
const config = require("./config/env");
const { connectDb } = require("./config/db");
const logger = require("./utils/logger");

async function start() {
  await connectDb();
  app.listen(config.port, () => {
    logger.log(
      `Backend listening on http://localhost:${config.port} [${config.env}]`,
    );
  });
}

start().catch((err) => {
  logger.error("Failed to start backend:", err);
  process.exit(1);
});
