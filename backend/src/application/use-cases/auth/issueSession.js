/** Shared by login + signup: turn an authenticated user into a session payload. */
function issueSession(user, tokenService) {
  const { access_token, refresh_token, expires_in } = tokenService.issue(user);
  return { access_token, refresh_token, expires_in, user: user.toPublic() };
}

module.exports = issueSession;
