const asyncHandler = require("../asyncHandler");

/**
 * @param {{
 *   checkAccountExists: (email: string) => Promise<{exists: boolean, login_hint: string|null}>,
 *   login: (email: string, password: string) => Promise<object>,
 *   signup: (input: object) => Promise<object>,
 * }} useCases
 */
function makeAuthController({ checkAccountExists, login, signup }) {
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

  return {
    accountExists,
    login: loginHandler,
    signup: signupHandler,
  };
}

module.exports = makeAuthController;
