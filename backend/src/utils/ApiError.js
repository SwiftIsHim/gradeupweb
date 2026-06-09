/**
 * Operational error with an HTTP status code. Thrown anywhere in the request
 * lifecycle and rendered by the central error handler.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static conflict(message, details) {
    return new ApiError(409, message, details);
  }

  static tooManyRequests(message = "Too many requests. Please try again later.") {
    return new ApiError(429, message);
  }
}

module.exports = ApiError;
