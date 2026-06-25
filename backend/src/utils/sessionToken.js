/**
 * Stub session-token helpers.
 *
 * The real source of truth for tokens is the Civilpromo GraphQL API. Until that
 * is wired up we issue an opaque stub access token that encodes the user's email
 * so it can be decoded back on authenticated requests. Keep encode/decode here so
 * issuance (auth.service) and verification (requireAuth middleware) never drift.
 *
 * Shape: `stub.<base64url(email)>.access`
 */

function encodeAccessToken(email) {
  return `stub.${Buffer.from(email).toString("base64url")}.access`;
}

/** Decode a stub access token back to its email, or null if malformed. */
function decodeAccessToken(token) {
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
}

module.exports = { encodeAccessToken, decodeAccessToken };
