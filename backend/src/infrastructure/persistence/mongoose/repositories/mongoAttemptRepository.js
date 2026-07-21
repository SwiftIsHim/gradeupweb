const { makeAttemptModel } = require("../schemas/attempt.schema");
const Attempt = require("../../../../domain/entities/Attempt");

const SLUG_FIELDS = { test: "testSlug", diagnostic: "diagnosticSlug" };
const MODEL_NAMES = { test: "TestAttempt", diagnostic: "DiagnosticAttempt" };

function toEntity(kind, slugField, doc) {
  if (!doc) return null;
  return new Attempt({
    id: doc._id ? String(doc._id) : undefined,
    userId: doc.user ? String(doc.user) : undefined,
    kind,
    slug: doc[slugField],
    score: doc.score,
    total: doc.total,
    durationSeconds: doc.durationSeconds,
    answers: doc.answers,
    takenAt: doc.createdAt,
  });
}

/**
 * Builds an AttemptRepository bound to one kind ("test" | "diagnostic"),
 * backed by its own Mongoose model/collection (unchanged collection/field
 * names — `testattempts`/`testSlug` and `diagnosticattempts`/`diagnosticSlug`).
 * @implements {import("../../../../domain/ports").AttemptRepository & { kind: string }}
 */
function makeMongoAttemptRepository(kind) {
  const slugField = SLUG_FIELDS[kind];
  const Model = makeAttemptModel(MODEL_NAMES[kind], slugField);

  return {
    kind,

    async listByUser(userId) {
      const docs = await Model.find({ user: userId }).sort({ createdAt: -1 }).lean();
      return docs.map((doc) => toEntity(kind, slugField, doc));
    },

    async listByUserAndSlug(userId, slug) {
      const docs = await Model.find({ user: userId, [slugField]: slug }).sort({ createdAt: -1 }).lean();
      return docs.map((doc) => toEntity(kind, slugField, doc));
    },

    async create(attempt) {
      const doc = await Model.create({
        user: attempt.userId,
        [slugField]: attempt.slug,
        score: attempt.score,
        total: attempt.total,
        durationSeconds: attempt.durationSeconds,
        answers: attempt.answers,
      });
      return toEntity(kind, slugField, doc);
    },
  };
}

module.exports = { makeMongoAttemptRepository };
