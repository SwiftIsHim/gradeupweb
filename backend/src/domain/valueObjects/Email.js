const { ValidationError } = require("../errors");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return EMAIL_RE.test(email);
}

/** Normalize + validate, throwing ValidationError with a field-specific message either way. */
function assertValidEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    throw new ValidationError("Email is required.", { field: "email" });
  }
  if (!isValidEmail(normalized)) {
    throw new ValidationError("Enter a valid email address.", { field: "email" });
  }
  return normalized;
}

module.exports = { normalizeEmail, isValidEmail, assertValidEmail };
