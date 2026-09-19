const { ValidationError } = require("../errors");

const TYPES = new Set(["score", "learning", "quizShare", "examShare"]);
const CONTENT_KINDS = new Set(["test", "diagnostic"]);
// quizShare/examShare map onto the existing attempt-kind vocabulary rather than
// inventing new content-type concepts (see Attempt.js's kind: "test"|"diagnostic").
const REQUIRED_KIND_FOR_TYPE = { quizShare: "test", examShare: "diagnostic" };

function str(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function validateScorePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError("payload is required for a score post.", { field: "payload" });
  }
  if (!CONTENT_KINDS.has(payload.kind)) {
    throw new ValidationError("payload.kind must be 'test' or 'diagnostic'.", { field: "payload.kind" });
  }
  const slug = str(payload.slug);
  if (!slug) {
    throw new ValidationError("payload.slug is required.", { field: "payload.slug" });
  }
  const title = str(payload.title);
  if (!title) {
    throw new ValidationError("payload.title is required.", { field: "payload.title" });
  }
  if (!Number.isInteger(payload.total) || payload.total < 1) {
    throw new ValidationError("payload.total must be an integer >= 1.", { field: "payload.total" });
  }
  if (!Number.isInteger(payload.score) || payload.score < 0 || payload.score > payload.total) {
    throw new ValidationError("payload.score must be an integer between 0 and payload.total.", {
      field: "payload.score",
    });
  }
  return { kind: payload.kind, slug, title, score: payload.score, total: payload.total };
}

function validateSharedContentPayload(type, payload) {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError(`payload is required for a ${type} post.`, { field: "payload" });
  }
  const requiredKind = REQUIRED_KIND_FOR_TYPE[type];
  if (payload.kind !== requiredKind) {
    throw new ValidationError(`payload.kind must be '${requiredKind}' for a ${type} post.`, {
      field: "payload.kind",
    });
  }
  const slug = str(payload.slug);
  if (!slug) {
    throw new ValidationError("payload.slug is required.", { field: "payload.slug" });
  }
  const title = str(payload.title);
  if (!title) {
    throw new ValidationError("payload.title is required.", { field: "payload.title" });
  }
  const subject = str(payload.subject) || null;
  if (!Number.isInteger(payload.questionCount) || payload.questionCount < 1) {
    throw new ValidationError("payload.questionCount must be an integer >= 1.", { field: "payload.questionCount" });
  }
  let bestScore = null;
  if (payload.bestScore !== undefined && payload.bestScore !== null) {
    if (!Number.isInteger(payload.bestScore) || payload.bestScore < 0 || payload.bestScore > 100) {
      throw new ValidationError("payload.bestScore must be an integer between 0 and 100.", {
        field: "payload.bestScore",
      });
    }
    bestScore = payload.bestScore;
  }
  return { kind: requiredKind, slug, title, subject, questionCount: payload.questionCount, bestScore };
}

/**
 * A feed item. `communityId` of `null` means the global feed. Payload content
 * (quiz/exam titles, slugs) is client-supplied and only shape-validated here —
 * this backend never owns test/exam content, same trust boundary as Attempt.
 */
class Post {
  constructor({
    id,
    authorId,
    communityId,
    type,
    caption,
    payload,
    reactionCount,
    commentCount,
    createdAt,
  }) {
    this.id = id;
    this.authorId = authorId;
    this.communityId = communityId ?? null;
    this.type = type;
    this.caption = caption ?? "";
    this.payload = payload ?? null;
    this.reactionCount = reactionCount ?? 0;
    this.commentCount = commentCount ?? 0;
    this.createdAt = createdAt ?? null;
  }

  static create({ authorId, communityId, type, caption, payload }) {
    if (!authorId) {
      throw new ValidationError("authorId is required.", { field: "authorId" });
    }
    if (!TYPES.has(type)) {
      throw new ValidationError("type must be one of score, learning, quizShare, examShare.", { field: "type" });
    }

    if (type === "learning") {
      const body = str(caption);
      if (!body || body.length > 1000) {
        throw new ValidationError("A learning note must be 1-1000 characters.", { field: "caption" });
      }
      return new Post({ authorId, communityId: communityId ?? null, type, caption: body, payload: null });
    }

    const trimmedCaption = str(caption);
    if (trimmedCaption.length > 500) {
      throw new ValidationError("Caption must be 500 characters or fewer.", { field: "caption" });
    }

    const normalizedPayload =
      type === "score" ? validateScorePayload(payload) : validateSharedContentPayload(type, payload);

    return new Post({
      authorId,
      communityId: communityId ?? null,
      type,
      caption: trimmedCaption,
      payload: normalizedPayload,
    });
  }

  isAuthor(userId) {
    return String(this.authorId) === String(userId);
  }

  toPublic() {
    return {
      id: this.id,
      authorId: this.authorId,
      communityId: this.communityId,
      type: this.type,
      caption: this.caption,
      payload: this.payload,
      reactionCount: this.reactionCount,
      commentCount: this.commentCount,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Post;
