const DAY_MS = 24 * 60 * 60 * 1000;

function dayStart(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Consecutive-day study streak, computed from raw activity timestamps
 * (test/diagnostic attempts, chapter quiz results — anything with a
 * `takenAt`/`createdAt`). Pure function, no I/O, so it's cheap to unit test.
 *
 * A day with no activity *yet* (today, before the user has studied) doesn't
 * zero out a streak that's still alive as of yesterday; a full skipped day
 * does.
 */
function computeStreakDays(activityDates, now = new Date()) {
  const days = new Set(activityDates.filter(Boolean).map((d) => dayStart(new Date(d))));

  const today = dayStart(now);
  let cursor;
  if (days.has(today)) {
    cursor = today;
  } else if (days.has(today - DAY_MS)) {
    cursor = today - DAY_MS;
  } else {
    return 0;
  }

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

module.exports = { computeStreakDays };
