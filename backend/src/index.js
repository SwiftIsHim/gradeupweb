const app = require("./app");
const config = require("./infrastructure/config/env");
const { connectDb } = require("./infrastructure/config/db");
const logger = require("./infrastructure/logging/logger");

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
