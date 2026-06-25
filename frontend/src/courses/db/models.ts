import { Model } from "@nozbe/watermelondb"

import type {
  ChapterSection,
  ContentOption,
  KeyTerm,
} from "@/src/courses/model/courses"

/**
 * WatermelonDB models for course content, written *without* decorators.
 *
 * The canonical WatermelonDB style uses TypeScript decorators (`@field`,
 * `@text`), which would require a Babel config and disable Turbopack. Instead
 * each field is a plain getter over `_getRaw` (exactly what the decorators
 * compile to), and JSON columns are parsed on read. These models are
 * read-only here; seeding writes raw columns directly (see ./seed).
 */

function parseJSON<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || value.length === 0) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export class CourseModel extends Model {
  static table = "courses"

  get slug(): string {
    return (this._getRaw("slug") as string) ?? ""
  }
  get title(): string {
    return (this._getRaw("title") as string) ?? ""
  }
  get description(): string {
    return (this._getRaw("description") as string) ?? ""
  }
  get coverUrl(): string {
    return (this._getRaw("cover_url") as string) ?? ""
  }
  get totalChapters(): number {
    return (this._getRaw("total_chapters") as number) ?? 0
  }
  get totalPages(): number {
    return (this._getRaw("total_pages") as number) ?? 0
  }
}

export class ChapterModel extends Model {
  static table = "chapters"

  get courseSlug(): string {
    return (this._getRaw("course_slug") as string) ?? ""
  }
  get chapterNumber(): number {
    return (this._getRaw("chapter_number") as number) ?? 0
  }
  get title(): string {
    return (this._getRaw("title") as string) ?? ""
  }
  get sections(): ChapterSection[] {
    return parseJSON<ChapterSection[]>(this._getRaw("sections"), [])
  }
  get learningObjectives(): string[] {
    return parseJSON<string[]>(this._getRaw("learning_objectives"), [])
  }
  get keyTerms(): KeyTerm[] {
    return parseJSON<KeyTerm[]>(this._getRaw("key_terms"), [])
  }
}

export class QuestionModel extends Model {
  static table = "questions"

  get courseSlug(): string {
    return (this._getRaw("course_slug") as string) ?? ""
  }
  get chapterNumber(): number {
    return (this._getRaw("chapter_number") as number) ?? 0
  }
  get stem(): string {
    return (this._getRaw("stem") as string) ?? ""
  }
  get explanation(): string {
    return (this._getRaw("explanation") as string) ?? ""
  }
  get difficulty(): number {
    return (this._getRaw("difficulty") as number) ?? 1
  }
  get options(): ContentOption[] {
    return parseJSON<ContentOption[]>(this._getRaw("options"), [])
  }
}
