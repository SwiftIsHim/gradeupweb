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

module.exports = { welcomeEmail };
