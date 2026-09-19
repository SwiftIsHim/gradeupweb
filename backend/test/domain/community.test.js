const test = require("node:test");
const assert = require("node:assert/strict");

const Community = require("../../src/domain/entities/Community");
const { ValidationError } = require("../../src/domain/errors");

test("Community.create builds a community with defaults", () => {
  const community = Community.create({ name: "JAMB Physics", createdBy: "user-1" });
  assert.equal(community.name, "JAMB Physics");
  assert.equal(community.description, "");
  assert.equal(community.examTag, null);
  assert.deepEqual(community.subjects, []);
  assert.equal(community.memberCount, 0);
  assert.equal(community.isPublic, true);
});

test("Community.create rejects a name that's too short", () => {
  assert.throws(() => Community.create({ name: "JS", createdBy: "user-1" }), ValidationError);
});

test("Community.create rejects a name that's too long", () => {
  assert.throws(() => Community.create({ name: "x".repeat(61), createdBy: "user-1" }), ValidationError);
});

test("Community.create rejects a description over 280 characters", () => {
  assert.throws(
    () => Community.create({ name: "JAMB Physics", description: "x".repeat(281), createdBy: "user-1" }),
    ValidationError
  );
});

test("Community.create requires createdBy", () => {
  assert.throws(() => Community.create({ name: "JAMB Physics" }), ValidationError);
});

test("Community.create trims and dedupes subjects", () => {
  const community = Community.create({
    name: "JAMB Physics",
    subjects: [" Physics ", "Physics", "Chemistry", ""],
    createdBy: "user-1",
  });
  assert.deepEqual(community.subjects, ["Physics", "Chemistry"]);
});
