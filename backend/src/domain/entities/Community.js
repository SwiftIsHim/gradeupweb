const { ValidationError } = require("../errors");

function normalizeSubjects(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  for (const s of raw) {
    const trimmed = String(s ?? "").trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
}

/** A community learners join by exam, subject, or study goal. Public-only in this pass. */
class Community {
  constructor({
    id,
    name,
    description,
    examTag,
    subjects,
    memberCount,
    isPublic,
    createdBy,
    createdAt,
  }) {
    this.id = id;
    this.name = name;
    this.description = description ?? "";
    this.examTag = examTag ?? null;
    this.subjects = subjects ?? [];
    this.memberCount = memberCount ?? 0;
    this.isPublic = isPublic ?? true;
    this.createdBy = createdBy;
    this.createdAt = createdAt ?? null;
  }

  /** Build a new (not-yet-persisted) community. `memberCount` starts at 0 — the creator's admin membership is a separate write. */
  static create({ name, description, examTag, subjects, createdBy }) {
    const trimmedName = String(name ?? "").trim();
    if (trimmedName.length < 3 || trimmedName.length > 60) {
      throw new ValidationError("Community name must be 3-60 characters.", { field: "name" });
    }
    const trimmedDescription = String(description ?? "").trim();
    if (trimmedDescription.length > 280) {
      throw new ValidationError("Description must be 280 characters or fewer.", { field: "description" });
    }
    const trimmedExamTag = String(examTag ?? "").trim() || null;
    if (!createdBy) {
      throw new ValidationError("createdBy is required.", { field: "createdBy" });
    }
    return new Community({
      name: trimmedName,
      description: trimmedDescription,
      examTag: trimmedExamTag,
      subjects: normalizeSubjects(subjects),
      createdBy,
      memberCount: 0,
      isPublic: true,
    });
  }

  toPublic() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      examTag: this.examTag,
      subjects: this.subjects,
      memberCount: this.memberCount,
      isPublic: this.isPublic,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Community;
