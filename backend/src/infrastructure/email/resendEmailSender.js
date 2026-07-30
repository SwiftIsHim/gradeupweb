const { Resend } = require("resend");
const config = require("../config/env");
const logger = require("../logging/logger");

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

/**
 * Best-effort email sender — matches the EmailSender port contract by never
 * rejecting. With no RESEND_API_KEY configured (e.g. local dev), sends are
 * skipped and logged instead of hitting the network.
 * @implements {import("../../domain/ports").EmailSender}
 */
const resendEmailSender = {
  async send({ to, subject, html, text }) {
    if (!resend) {
      logger.warn(`[email] RESEND_API_KEY not set — skipping send to ${to}: ${subject}`);
      return;
    }
    try {
      const { error } = await resend.emails.send({ from: config.emailFrom, to, subject, html, text });
      if (error) {
        logger.error("[email] Resend rejected the send:", error);
      }
    } catch (err) {
      logger.error("[email] Resend send threw:", err);
    }
  },
};

module.exports = resendEmailSender;
