const crypto = require("crypto");
const { ValidationError } = require("../errors");
const { assertValidEmail } = require("../valueObjects/Email");

// E.164: a leading "+" then 7-15 digits, first digit non-zero.
const E164_RE = /^\+[1-9]\d{6,14}$/;

class User {
  constructor({
    id,
    email,
    phone,
    name,
    organization,
    loginHint,
    passwordHash,
    passwordResetTokenHash,
    passwordResetTokenExpiresAt,
  }) {
    this.id = id;
    this.email = email;
    this.phone = phone;
    this.name = name;
    this.organization = organization;
    this.loginHint = loginHint || "Use password";
    // Only populated when the repository was asked to include it (login flow).
    this.passwordHash = passwordHash;
    // Only populated when the repository was asked to include it (reset-password flow).
    this.passwordResetTokenHash = passwordResetTokenHash ?? null;
    this.passwordResetTokenExpiresAt = passwordResetTokenExpiresAt ?? null;
  }

  /** Build a new (not-yet-persisted) user. `passwordHash` must already be hashed — see PasswordHasher port. */
  static create({ email, phone, name, organization, passwordHash }) {
    const normalizedEmail = assertValidEmail(email);
    const trimmedPhone = String(phone || "").trim();
    if (!trimmedPhone) {
      throw new ValidationError("Phone number is required.", { field: "phone" });
    }
    if (!E164_RE.test(trimmedPhone)) {
      throw new ValidationError("Phone must be in E.164 format (e.g. +2348012345678).", { field: "phone" });
    }
    if (!passwordHash) {
      throw new ValidationError("A password hash is required.", { field: "password" });
    }
    return new User({
      email: normalizedEmail,
      phone: trimmedPhone,
      name,
      organization,
      passwordHash,
      loginHint: "Use password",
    });
  }

  async verifyPassword(plain, passwordHasher) {
    if (!this.passwordHash) {
      throw new ValidationError("Password hash was not loaded for this user.");
    }
    return passwordHasher.verify(plain, this.passwordHash);
  }

  /** Generate a password-reset token. Only the hash is ever persisted; the raw token is emailed once. */
  static generateResetToken() {
    const rawToken = crypto.randomBytes(32).toString("hex");
    return { rawToken, tokenHash: User.hashResetToken(rawToken) };
  }

  static hashResetToken(rawToken) {
    return crypto.createHash("sha256").update(String(rawToken)).digest("hex");
  }

  /** True if `tokenHash` matches this user's stored reset token and it hasn't expired. */
  isResetTokenValid(tokenHash) {
    return Boolean(
      this.passwordResetTokenHash &&
        this.passwordResetTokenHash === tokenHash &&
        this.passwordResetTokenExpiresAt &&
        this.passwordResetTokenExpiresAt.getTime() > Date.now()
    );
  }

  toPublic() {
    return { id: this.id, email: this.email, phone: this.phone, name: this.name };
  }
}

module.exports = User;
