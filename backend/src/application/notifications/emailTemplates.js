/** Plain HTML email bodies. Kept intentionally simple — no templating engine. */

function welcomeEmail(user) {
  const name = user.name || "there";
  return {
    to: user.email,
    subject: "Welcome to Grade Up",
    html: `<p>Hi ${name},</p><p>Welcome to Grade Up — your account is ready to go.</p>`,
    text: `Hi ${name},\n\nWelcome to Grade Up — your account is ready to go.`,
  };
}

function passwordResetEmail(user, resetUrl) {
  const name = user.name || "there";
  return {
    to: user.email,
    subject: "Reset your Grade Up password",
    html: `<p>Hi ${name},</p><p>Click the link below to reset your password. This link expires in an hour and can only be used once.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
    text: `Hi ${name},\n\nReset your password: ${resetUrl}\n\nThis link expires in an hour and can only be used once. If you didn't request this, you can safely ignore this email.`,
  };
}

module.exports = { welcomeEmail, passwordResetEmail };
