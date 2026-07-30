const { ValidationError } = require("../errors");

// Mirrors the frontend onboarding model (src/onboarding/model).
const GOALS = ["promotion", "confirmation", "conversion", "general"];
const GRADES = ["6", "7", "8", "9", "10"];
const MINUTES = ["15", "30", "45", "60"];
const SCHEDULES = ["weekday-mornings", "weekday-evenings", "weekends", "flexible"];
const EXAM_MODES = ["4w", "8w", "custom"];
const NOTIFICATIONS = ["on", "off"];

function str(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function oneOf(value, allowed, field, message) {
  const v = str(value);
  if (!allowed.includes(v)) {
    throw new ValidationError(message, { field });
  }
  return v;
}

class OnboardingProfile {
  constructor({
    id,
    userId,
    firstName,
    lastName,
    goal,
    gradeLevel,
    subjects,
    examDateMode,
    examDate,
    dailyMinutes,
    schedule,
    notifications,
    completedAt,
  }) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.goal = goal;
    this.gradeLevel = gradeLevel;
    this.subjects = subjects;
    this.examDateMode = examDateMode;
    this.examDate = examDate;
    this.dailyMinutes = dailyMinutes;
    this.schedule = schedule;
    this.notifications = notifications;
    this.completedAt = completedAt;
  }

  /** Validate + build a profile ready to persist. Full overwrite semantics — one profile per user. */
  static create(userId, input) {
    const firstName = str(input.firstName);
    if (!firstName) {
      throw new ValidationError("First name is required.", { field: "firstName" });
    }
    const lastName = str(input.lastName) || undefined;
    const goal = oneOf(input.goal, GOALS, "goal", "Pick a valid goal.");
    const gradeLevel = oneOf(input.gradeLevel, GRADES, "gradeLevel", "Pick a valid grade level.");

    const subjects = Array.isArray(input.subjects)
      ? input.subjects.map(str).filter(Boolean)
      : [];
    if (subjects.length === 0) {
      throw new ValidationError("Pick at least one subject.", { field: "subjects" });
    }

    const examDateMode = oneOf(input.examDateMode, EXAM_MODES, "examDateMode", "Pick a valid exam date mode.");
    const examDate = new Date(input.examDate);
    if (Number.isNaN(examDate.getTime())) {
      throw new ValidationError("A valid exam date is required.", { field: "examDate" });
    }
    const dailyMinutes = oneOf(input.dailyMinutes, MINUTES, "dailyMinutes", "Pick a valid daily minutes value.");
    const schedule = oneOf(input.schedule, SCHEDULES, "schedule", "Pick a valid schedule.");
    const notifications = oneOf(input.notifications, NOTIFICATIONS, "notifications", "Pick a valid notifications value.");

    return new OnboardingProfile({
      userId,
      firstName,
      lastName,
      goal,
      gradeLevel,
      subjects,
      examDateMode,
      examDate,
      dailyMinutes,
      schedule,
      notifications,
      completedAt: new Date(),
    });
  }

  toPublic() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      goal: this.goal,
      gradeLevel: this.gradeLevel,
      subjects: this.subjects,
      examDateMode: this.examDateMode,
      examDate: this.examDate,
      dailyMinutes: this.dailyMinutes,
      schedule: this.schedule,
      notifications: this.notifications,
      completedAt: this.completedAt,
    };
  }
}

module.exports = OnboardingProfile;
