const mongoose = require("mongoose");

/**
 * A user's onboarding answers (one document per user). Upserted when the user
 * finishes the onboarding flow, so re-running onboarding overwrites in place.
 */
const onboardingProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    goal: { type: String, trim: true },
    gradeLevel: { type: String, trim: true },
    subjects: { type: [String], default: [] },
    examDateMode: { type: String, enum: ["4w", "8w", "custom"] },
    examDate: { type: Date },
    dailyMinutes: { type: String, trim: true },
    schedule: { type: String, trim: true },
    notifications: { type: String, enum: ["on", "off"] },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnboardingProfile", onboardingProfileSchema);
