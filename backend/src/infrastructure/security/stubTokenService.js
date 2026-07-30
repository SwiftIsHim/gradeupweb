const config = require("../config/env");

/**
 * Stub TokenService implementation.
 *
 * The real source of truth for tokens is the Civilpromo GraphQL API. Until
 * that is wired up we issue an opaque stub access token that encodes the
 * user's email so it can be decoded back on authenticated requests. Swap
 * this module for a GraphQL-backed implementation in composition/container.js
 * once that mutation exists — nothing outside infrastructure/ has to change.
 *
 * Shape: `stub.<base64url(email)>.access`
 *
 * @implements {import("../../domain/ports").TokenService}
 */
const stubTokenService = {
  issue(user) {
    return {
      access_token: encodeAccessToken(user.email),
      refresh_token: `stub.${user.id}.refresh`,
      expires_in: config.accessTokenTtlSeconds,
    };
  },

  decodeEmail(token) {
    const parts = String(token || "").split(".");
    if (parts.length !== 3 || parts[0] !== "stub" || parts[2] !== "access") {
      return null;
    }
    try {
      const email = Buffer.from(parts[1], "base64url").toString("utf8");
      return email || null;
    } catch {
      return null;
    }
  },
};

function encodeAccessToken(email) {
  return `stub.${Buffer.from(email).toString("base64url")}.access`;
}

module.exports = stubTokenService;
