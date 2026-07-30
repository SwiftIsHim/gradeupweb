const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const config = require("./infrastructure/config/env");
const { buildRoutes } = require("./composition/container");
const { notFound, errorHandler } = require("./interfaces/http/middleware/errorHandler");

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
if (config.env !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "gradeup-backend" });
});

// All API routes (health, /auth/*)
app.use("/", buildRoutes());

// 404 + central error handler (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
