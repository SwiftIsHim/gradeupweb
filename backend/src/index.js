const app = require("./app");
const config = require("./config/env");
const { connectDb } = require("./config/db");

async function start() {
  await connectDb();
  app.listen(config.port, () => {
    console.log(
      `Backend listening on http://localhost:${config.port} [${config.env}]`
    );
  });
}

start().catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});
