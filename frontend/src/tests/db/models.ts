import { Model } from "@nozbe/watermelondb"

import type { TestOption } from "@/src/tests/model/tests"

/**
 * Decorator-free WatermelonDB models for test content (see
 * src/courses/db/models for why decorators are avoided). Read-only here;
 * seeding writes raw columns directly.
 */

function parseJSON<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || value.length === 0) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export class TestModel extends Model {
  static table = "tests"

  get slug(): string {
    return (this._getRaw("slug") as string) ?? ""
  }
  get title(): string {
    return (this._getRaw("title") as string) ?? ""
  }
  get description(): string {
    return (this._getRaw("description") as string) ?? ""
  }
  get questionCount(): number {
    return (this._getRaw("question_count") as number) ?? 0
  }
  get timeLimitMinutes(): number {
    return (this._getRaw("time_limit_minutes") as number) ?? 0
  }
}

export class TestQuestionModel extends Model {
  static table = "test_questions"

  get testSlug(): string {
    return (this._getRaw("test_slug") as string) ?? ""
  }
  get orderIndex(): number {
    return (this._getRaw("order_index") as number) ?? 0
  }
  get prompt(): string {
    return (this._getRaw("prompt") as string) ?? ""
  }
  get options(): TestOption[] {
    return parseJSON<TestOption[]>(this._getRaw("options"), [])
  }
  get answerKey(): string {
    return (this._getRaw("answer_key") as string) ?? ""
  }
}
