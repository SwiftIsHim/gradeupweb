const ApiError = require("../utils/ApiError");
const { normalizeEmail, isValidEmail } = require("../utils/email");

// E.164: a leading "+" then 7–15 digits, first digit non-zero.
const E164_RE = /^\+[1-9]\d{6,14}$/;

function requireEmail(body) {
  const email = normalizeEmail(body.email);
  if (!email) throw ApiError.badRequest("Email is required.", { field: "email" });
  if (!isValidEmail(email)) {
    throw ApiError.badRequest("Enter a valid email address.", { field: "email" });
  }
  return email;
}

function validateAccountExists(body) {
  return { email: requireEmail(body) };
}

function validateLogin(body) {
  const email = requireEmail(body);
  if (!body.password) {
    throw ApiError.badRequest("Password is required.", { field: "password" });
  }
  return { email, password: String(body.password) };
}

function validateSignup(body) {
  const email = requireEmail(body);

  const phone = String(body.phone || "").trim();
  if (!phone) throw ApiError.badRequest("Phone number is required.", { field: "phone" });
  if (!E164_RE.test(phone)) {
    throw ApiError.badRequest(
      "Phone must be in E.164 format (e.g. +2348012345678).",
      { field: "phone" }
    );
  }

  if (!body.password) {
    throw ApiError.badRequest("Password is required.", { field: "password" });
  }
  const password = String(body.password);
  if (password.length < 8) {
    throw ApiError.badRequest("Password must be at least 8 characters.", {
      field: "password",
    });
  }

  return {
    email,
    phone,
    name: body.name ? String(body.name).trim() : undefined,
    organization: body.organization ? String(body.organization).trim() : undefined,
    password,
  };
}

module.exports = { validateAccountExists, validateLogin, validateSignup };
