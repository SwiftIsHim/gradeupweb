const {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} = require("../../../domain/errors");
const logger = require("../../../infrastructure/logging/logger");

const STATUS_BY_ERROR = [
  [ValidationError, 400],
  [UnauthorizedError, 401],
  [NotFoundError, 404],
  [ConflictError, 409],
];

function statusFor(err) {
  const match = STATUS_BY_ERROR.find(([ErrorClass]) => err instanceof ErrorClass);
  return match ? match[1] : 500;
}

function notFound(req, res, next) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = statusFor(err);
  const isExposed = statusCode < 500;

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
