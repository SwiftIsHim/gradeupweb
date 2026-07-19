const { ValidationError, ConflictError } = require("../../../domain/errors");
const User = require("../../../domain/entities/User");
const { welcomeEmail } = require("../../notifications/emailTemplates");
const issueSession = require("./issueSession");

/**
 * @param {{
 *   userRepository: import("../../../domain/ports").UserRepository,
 *   passwordHasher: import("../../../domain/ports").PasswordHasher,
 *   tokenService: import("../../../domain/ports").TokenService,
 *   emailSender: import("../../../domain/ports").EmailSender,
 * }} deps
 */
function makeSignup({ userRepository, passwordHasher, tokenService, emailSender }) {
  /** Signup completion — create account + auto-login. (OTP step omitted.) */
  return async function signup(input) {
    if (!input.password) {
      throw new ValidationError("Password is required.", { field: "password" });
    }
    const password = String(input.password);
    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters.", { field: "password" });
    }

    const passwordHash = await passwordHasher.hash(password);
    const user = User.create({
      email: input.email,
      phone: input.phone,
      name: input.name,
      organization: input.organization,
      passwordHash,
    });

    const existing = await userRepository.findByEmail(user.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists.");
    }

    // The repository translates the unique-index race (concurrent signup) into ConflictError too.
    const created = await userRepository.create(user);
    // Not awaited: EmailSender.send never rejects, and we don't want Resend's
    // latency to delay the signup response.
    emailSender.send(welcomeEmail(created));
    return issueSession(created, tokenService);
  };
}

module.exports = makeSignup;
