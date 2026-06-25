import { Q } from "@nozbe/watermelondb"

import { getTestsDatabase } from "./database"
import { ensureSeeded } from "./seed"
import type { TestModel, TestQuestionModel } from "./models"
import type { TestContent } from "@/src/tests/model/tests"

/**
 * Read-side of the local test store. Each helper ensures content is seeded,
 * then reads it back out of WatermelonDB. Attempts are merged in by callers
 * (see ../data/loadTests).
 */

/** Lightweight catalog entry (no question bodies). */
export interface TestCatalogEntry {
  slug: string
  title: string
  description: string
  questionCount: number
  timeLimitMinutes: number
}

export async function queryTestCatalog(): Promise<TestCatalogEntry[]> {
  await ensureSeeded()
  const db = await getTestsDatabase()
  const tests = (await db
    .get<TestModel>("tests")
    .query()
    .fetch()) as TestModel[]

  return tests
    .map((t) => ({
      slug: t.slug,
      title: t.title,
      description: t.description,
      questionCount: t.questionCount,
      timeLimitMinutes: t.timeLimitMinutes,
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

/** Full content for one test (questions ordered). */
export async function queryTest(slug: string): Promise<TestContent | null> {
  await ensureSeeded()
  const db = await getTestsDatabase()

  const tests = (await db
    .get<TestModel>("tests")
    .query(Q.where("slug", slug))
    .fetch()) as TestModel[]
  const test = tests[0]
  if (!test) return null

  const questions = (await db
    .get<TestQuestionModel>("test_questions")
    .query(Q.where("test_slug", slug))
    .fetch()) as TestQuestionModel[]

  return {
    slug: test.slug,
    title: test.title,
    description: test.description,
    questionCount: test.questionCount,
    timeLimitMinutes: test.timeLimitMinutes,
    questions: questions
      .map((q) => ({
        index: q.orderIndex,
        prompt: q.prompt,
        options: q.options,
        answerKey: q.answerKey,
      }))
      .sort((a, b) => a.index - b.index),
  }
}
