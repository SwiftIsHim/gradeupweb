const test = require("node:test");
const assert = require("node:assert/strict");

const { computeStreakDays } = require("../../src/domain/services/studyStreak");

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(now, n) {
  return new Date(now.getTime() - n * DAY_MS);
}

test("no activity at all -> 0", () => {
  const now = new Date("2026-08-25T12:00:00Z");
  assert.equal(computeStreakDays([], now), 0);
});

test("activity only today counts as a 1-day streak", () => {
  const now = new Date("2026-08-25T12:00:00Z");
  assert.equal(computeStreakDays([daysAgo(now, 0)], now), 1);
});

test("consecutive days count the full run", () => {
  const now = new Date("2026-08-25T12:00:00Z");
  const dates = [daysAgo(now, 0), daysAgo(now, 1), daysAgo(now, 2)];
  assert.equal(computeStreakDays(dates, now), 3);
});

test("a gap breaks the streak at the gap", () => {
  const now = new Date("2026-08-25T12:00:00Z");
  // Active today and yesterday, then a gap, then active 4 days ago.
  const dates = [daysAgo(now, 0), daysAgo(now, 1), daysAgo(now, 4)];
  assert.equal(computeStreakDays(dates, now), 2);
});

test("no activity yet today, but active yesterday, still counts", () => {
  const now = new Date("2026-08-25T08:00:00Z");
  const dates = [daysAgo(now, 1), daysAgo(now, 2)];
  assert.equal(computeStreakDays(dates, now), 2);
});

test("a gap between yesterday and today (i.e. nothing in the last 2 days) -> 0", () => {
  const now = new Date("2026-08-25T12:00:00Z");
  const dates = [daysAgo(now, 3), daysAgo(now, 4)];
  assert.equal(computeStreakDays(dates, now), 0);
});

test("duplicate timestamps within the same day only count once", () => {
  const now = new Date("2026-08-25T12:00:00Z");
  const dates = [
    new Date("2026-08-25T01:00:00Z"),
    new Date("2026-08-25T23:00:00Z"),
    daysAgo(now, 1),
  ];
  assert.equal(computeStreakDays(dates, now), 2);
});
