import { appSchema, tableSchema } from "@nozbe/watermelondb"

/**
 * WatermelonDB schema for locally-stored test content. Separate from the
 * courses database (different dbName), so the two stay independent. Options are
 * stored as a JSON string and parsed back by the model.
 */
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "tests",
      columns: [
        { name: "slug", type: "string", isIndexed: true },
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "question_count", type: "number" },
        { name: "time_limit_minutes", type: "number" },
      ],
    }),
    tableSchema({
      name: "test_questions",
      columns: [
        { name: "test_slug", type: "string", isIndexed: true },
        { name: "order_index", type: "number" },
        { name: "prompt", type: "string" },
        { name: "options", type: "string" },
        { name: "answer_key", type: "string" },
      ],
    }),
  ],
})
