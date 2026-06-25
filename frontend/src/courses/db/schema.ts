import { appSchema, tableSchema } from "@nozbe/watermelondb"

/**
 * WatermelonDB schema for locally-stored course content.
 *
 * Content is read-only on the client (it originates from the local JSON files,
 * served by /api/courses/content and seeded here). Rich fields — section
 * trees, objective/term lists, and quiz options — are stored as JSON strings
 * in `string` columns and parsed back by the models, since WatermelonDB only
 * supports scalar column types.
 */
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "courses",
      columns: [
        { name: "slug", type: "string", isIndexed: true },
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "cover_url", type: "string" },
        { name: "total_chapters", type: "number" },
        { name: "total_pages", type: "number" },
      ],
    }),
    tableSchema({
      name: "chapters",
      columns: [
        { name: "course_slug", type: "string", isIndexed: true },
        { name: "chapter_number", type: "number" },
        { name: "title", type: "string" },
        { name: "sections", type: "string" },
        { name: "learning_objectives", type: "string" },
        { name: "key_terms", type: "string" },
      ],
    }),
    tableSchema({
      name: "questions",
      columns: [
        { name: "course_slug", type: "string", isIndexed: true },
        { name: "chapter_number", type: "number", isIndexed: true },
        { name: "stem", type: "string" },
        { name: "explanation", type: "string" },
        { name: "difficulty", type: "number" },
        { name: "options", type: "string" },
      ],
    }),
  ],
})
