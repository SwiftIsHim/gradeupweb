const { ValidationError } = require("../errors");

const VALID_KEYS = new Set(["A", "B", "C", "D"]);
const KINDS = { test: "testSlug", diagnostic: "diagnosticSlug" };

function percent(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

function normalizeAnswers(raw, total) {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) {
    throw new ValidationError("answers must be an array.", { field: "answers" });
  }
  return raw.map((a, i) => {
    if (!Number.isInteger(a?.questionIndex) || a.questionIndex < 0 || a.questionIndex >= total) {
      throw new ValidationError(`answers[${i}].questionIndex is invalid.`, { field: "answers" });
    }
    if (a.correctKey === undefined || !VALID_KEYS.has(a.correctKey)) {
      throw new ValidationError(`answers[${i}].correctKey must be one of A/B/C/D.`, { field: "answers" });
    }
    if (a.selectedKey !== null && a.selectedKey !== undefined && !VALID_KEYS.has(a.selectedKey)) {
      throw new ValidationError(`answers[${i}].selectedKey must be one of A/B/C/D or null.`, { field: "answers" });
    }
    const selectedKey = a.selectedKey ?? null;
    return {
      questionIndex: a.questionIndex,
      selectedKey,
      correctKey: a.correctKey,
      isCorrect: selectedKey === a.correctKey,
    };
  });
}

/** A single test/diagnostic attempt. Content lives client-side; this only stores the result. */
class Attempt {
  constructor({ id, userId, kind, slug, score, total, durationSeconds, answers, takenAt }) {
    if (!KINDS[kind]) {
      throw new ValidationError(`Unknown attempt kind: ${kind}`);
    }
    this.id = id;
    this.userId = userId;
    this.kind = kind;
    this.slug = slug;
    this.score = score;
    this.total = total;
    this.durationSeconds = durationSeconds ?? null;
    this.answers = answers ?? [];
    this.takenAt = takenAt;
  }

  static create({ kind, userId, slug, score, total, durationSeconds, answers }) {
    if (!Number.isInteger(total) || total < 1) {
      throw new ValidationError("total must be an integer >= 1.", { field: "total" });
    }
    if (!Number.isInteger(score) || score < 0 || score > total) {
      throw new ValidationError("score must be an integer between 0 and total.", { field: "score" });
    }
    let duration = null;
    if (durationSeconds !== undefined && durationSeconds !== null) {
      if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds) || durationSeconds < 0) {
        throw new ValidationError("durationSeconds must be a finite number >= 0.", { field: "durationSeconds" });
      }
      duration = durationSeconds;
    }
    return new Attempt({
      kind,
      userId,
      slug,
      score,
      total,
      durationSeconds: duration,
      answers: normalizeAnswers(answers, total),
    });
  }

  get percent() {
    return percent(this.score, this.total);
  }

  toPublic() {
    return {
      id: this.id,
      [KINDS[this.kind]]: this.slug,
      score: this.score,
      total: this.total,
      percent: this.percent,
      durationSeconds: this.durationSeconds,
      takenAt: this.takenAt,
      answers: this.answers,
    };
  }
}

module.exports = Attempt;
