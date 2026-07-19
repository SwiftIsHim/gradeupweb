const asyncHandler = require("../asyncHandler");

/**
 * @param {{
 *   checkAccountExists: (email: string) => Promise<{exists: boolean, login_hint: string|null}>,
 *   login: (email: string, password: string) => Promise<object>,
 *   signup: (input: object) => Promise<object>,
 *   requestPasswordReset: (email: string) => Promise<{ok: boolean}>,
 *   resetPassword: (token: string, password: string) => Promise<{ok: boolean}>,
 * }} useCases
 */
function makeAuthController({ checkAccountExists, login, signup, requestPasswordReset, resetPassword }) {
  // POST /auth/account-exists  -> { exists, login_hint }
  const accountExists = asyncHandler(async (req, res) => {
    const result = await checkAccountExists(req.body.email);
    res.json(result);
  });

  // POST /auth/login  -> { access_token, refresh_token, expires_in, user }
  const loginHandler = asyncHandler(async (req, res) => {
    const session = await login(req.body.email, req.body.password);
    res.json(session);
  });

  // POST /auth/signup  -> { access_token, refresh_token, expires_in, user }
  const signupHandler = asyncHandler(async (req, res) => {
    const session = await signup(req.body);
    res.status(201).json(session);
  });

  // POST /auth/forgot-password  -> { ok: true } (always, regardless of whether the account exists)
  const forgotPassword = asyncHandler(async (req, res) => {
    const result = await requestPasswordReset(req.body.email);
    res.json(result);
  });

  // POST /auth/reset-password  -> { ok: true }
  const resetPasswordHandler = asyncHandler(async (req, res) => {
    const result = await resetPassword(req.body.token, req.body.password);
    res.json(result);
  });

  return {
    accountExists,
    login: loginHandler,
    signup: signupHandler,
    forgotPassword,
    resetPassword: resetPasswordHandler,
  };
}

module.exports = makeAuthController;
