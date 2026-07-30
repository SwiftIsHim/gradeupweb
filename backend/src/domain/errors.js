/**
 * Framework-agnostic errors. Nothing below interfaces/http knows about HTTP
 * status codes — interfaces/http/middleware/errorHandler.js maps these
 * classes to status codes at the edge.
 */

class DomainError extends Error {
  constructor(message, details) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

class ValidationError extends DomainError {}
class NotFoundError extends DomainError {}
class UnauthorizedError extends DomainError {}
class ConflictError extends DomainError {}

module.exports = { DomainError, ValidationError, NotFoundError, UnauthorizedError, ConflictError };
