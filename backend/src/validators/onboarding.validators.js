const ApiError = require("../utils/ApiError");

// Allowed values mirror the frontend onboarding model (src/onboarding/model).
const GOALS = ["promotion", "confirmation", "conversion", "general"];
const GRADES = ["6", "7", "8", "9", "10"];
const MINUTES = ["15", "30", "45", "60"];
const SCHEDULES = [
  "weekday-mornings",
  "weekday-evenings",
  "weekends",
  "flexible",
];
const EXAM_MODES = ["4w", "8w", "custom"];
const NOTIFICATIONS = ["on", "off"];

function str(value) {
  return value == null ? "" : String(value).trim();
}

function oneOf(value, allowed, field, message) {
  const v = str(value);
  if (!allowed.includes(v)) {
    throw ApiError.badRequest(message, { field });
  }
  return v;
}

function validateSaveOnboarding(body) {
  const firstName = str(body.firstName);
  if (!firstName) {
    throw ApiError.badRequest("First name is required.", { field: "firstName" });
  }

  const goal = oneOf(body.goal, GOALS, "goal", "Select a valid goal.");
  const gradeLevel = oneOf(
    body.gradeLevel,
    GRADES,
    "gradeLevel",
    "Select a valid grade level."
  );

  const subjects = Array.isArray(body.subjects)
    ? body.subjects.map(str).filter(Boolean)
    : [];
  if (subjects.length === 0) {
    throw ApiError.badRequest("Pick at least one subject.", {
      field: "subjects",
    });
  }

  const examDateMode = oneOf(
    body.examDateMode,
    EXAM_MODES,
    "examDateMode",
    "Select when your exam is."
  );

  const examDate = body.examDate ? new Date(body.examDate) : null;
  if (!examDate || Number.isNaN(examDate.getTime())) {
    throw ApiError.badRequest("A valid exam date is required.", {
      field: "examDate",
    });
  }

  const dailyMinutes = oneOf(
    body.dailyMinutes,
    MINUTES,
    "dailyMinutes",
    "Choose a daily study goal."
  );
  const schedule = oneOf(
    body.schedule,
    SCHEDULES,
    "schedule",
    "Choose when you study best."
  );
  const notifications = oneOf(
    body.notifications,
    NOTIFICATIONS,
    "notifications",
    "Choose a notification preference."
  );

  return {
    firstName,
    lastName: str(body.lastName) || undefined,
    goal,
    gradeLevel,
    subjects,
    examDateMode,
    examDate,
    dailyMinutes,
    schedule,
    notifications,
  };
}

module.exports = { validateSaveOnboarding };
