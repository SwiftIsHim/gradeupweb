const asyncHandler = require("../utils/asyncHandler");
const validators = require("../validators/auth.validators");
const authService = require("../services/auth.service");

// POST /auth/account-exists  → { exists, login_hint }
const accountExists = asyncHandler(async (req, res) => {
  const { email } = validators.validateAccountExists(req.body);
  const result = await authService.accountExists(email);
  res.json(result);
});

// POST /auth/login  → { access_token, refresh_token, expires_in, user }
const login = asyncHandler(async (req, res) => {
  const { email, password } = validators.validateLogin(req.body);
  const session = await authService.login(email, password);
  res.json(session);
});

// POST /auth/signup  → { access_token, refresh_token, expires_in, user }
const signup = asyncHandler(async (req, res) => {
  const input = validators.validateSignup(req.body);
  const session = await authService.signup(input);
  res.status(201).json(session);
});

module.exports = { accountExists, login, signup };
