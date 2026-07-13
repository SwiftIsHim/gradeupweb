const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isExposed = Boolean(err.statusCode); // ApiError / known status

  if (statusCode >= 500) {
    logger.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: isExposed ? err.message : "Internal server error.",
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

module.exports = { notFound, errorHandler };
