const config = require("../config/env");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
const { encodeAccessToken } = require("../utils/sessionToken");

/**
 * Accounts are persisted in MongoDB (see models/user.model.js).
 *
 * Token issuance is still a stub — the real source of truth for tokens is the
 * Civilpromo GraphQL API (config.graphqlEndpoint, "Bearer <accessToken>").
 * Replace issueSession() once that mutation is wired up.
 */

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
  };
}

function issueSession(user) {
  // TODO: return real signed tokens from the Civilpromo login/signup mutation.
  const accessToken = encodeAccessToken(user.email);
  return {
    access_token: accessToken,
    refresh_token: `stub.${user.id}.refresh`,
    expires_in: config.accessTokenTtlSeconds,
    user: publicUser(user),
  };
}

/** Step 1 — does an account exist for this email? */
async function accountExists(email) {
  const user = await User.findOne({ email }).lean();
  return {
    exists: Boolean(user),
    login_hint: user ? user.loginHint || "Use password" : null,
  };
}

/** Step 2 — email + password login. */
async function login(email, password) {
  // passwordHash is select:false, so request it explicitly for verification.
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw ApiError.unauthorized("No account found for this email.");
  }
  const ok = await user.verifyPassword(password);
  if (!ok) {
    throw ApiError.unauthorized("Incorrect password. Try again.");
  }
  return issueSession(user);
}

/** Signup completion — create account + auto-login. (OTP step omitted.) */
async function signup(input) {
  const existing = await User.findOne({ email: input.email }).lean();
  if (existing) {
    throw ApiError.conflict("An account with this email already exists.");
  }

  const user = new User({
    email: input.email,
    phone: input.phone,
    name: input.name,
    organization: input.organization,
    loginHint: "Use password",
  });
  await user.setPassword(input.password);

  try {
    await user.save();
  } catch (err) {
    // Unique index race: another request created the same email concurrently.
    if (err && err.code === 11000) {
      throw ApiError.conflict("An account with this email already exists.");
    }
    throw err;
  }

  return issueSession(user);
}

module.exports = { accountExists, login, signup };
