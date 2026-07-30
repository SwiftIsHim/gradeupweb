# Backend File Reference

A file-by-file reference for everything under `backend/`. For how these files
relate to each other architecturally, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Technologies used

| Package     | Version | Used for |
|-------------|---------|----------|
| `express`   | ^5.2.1  | HTTP server, routing, middleware pipeline |
| `mongoose`  | ^9.6.3  | MongoDB ODM — schemas, models, queries |
| `bcryptjs`  | ^3.0.3  | Password hashing (pure-JS bcrypt, no native build) |
| `cors`      | ^2.8.6  | CORS headers so the Next.js frontend (different origin) can call the API with credentials |
| `dotenv`    | ^17.4.2 | Loads `.env` into `process.env` at startup |
| `morgan`    | ^1.11.0 | HTTP request logging (dev only) |
| `resend`    | ^6.17.2 | Transactional email delivery (welcome + password-reset emails) |
| `node:test` (built-in) | — | Test runner — no Jest/Mocha; run via `npm test` |

No JWT library is in use yet — sessions currently use a stub token scheme (see
`infrastructure/security/stubTokenService.js` below). No ORM/validation library
(Joi/Zod/etc.) — validation is hand-written in domain entities/value objects.

---

## Root

### `src/index.js`
- **Tech:** Node.js
- **Purpose:** Process entry point. Connects to MongoDB, then starts the Express server.
- **Main function:** `start()` — `await connectDb()` then `app.listen(config.port, ...)`. Exits the process (`process.exit(1)`) if startup fails.

### `src/app.js`
- **Tech:** Express, `cors`, `morgan`
- **Purpose:** Builds the Express application object: global middleware, health route, mounts the composed API router, mounts 404 + error handler last.
- **Main content:** `app.use(cors(...))`, `app.use(express.json())`, `app.use(morgan("dev"))` (skipped in tests), `app.use("/", buildRoutes())`. Exports the configured `app` (no `.listen()` here — that's `index.js`'s job, which keeps `app.js` importable by tests without opening a port).

---

## `domain/` — business rules, zero external dependencies

### `domain/entities/User.js`
- **Tech:** Node's built-in `crypto` module only.
- **Purpose:** The user aggregate — identity, password verification, password-reset tokens.
- **Main functions:**
  - `User.create({email, phone, name, organization, passwordHash})` — validates email format, requires an E.164 phone number (regex-checked), requires a pre-hashed password; throws `ValidationError` otherwise.
  - `verifyPassword(plain, passwordHasher)` — delegates the actual comparison to the injected `PasswordHasher` port.
  - `User.generateResetToken()` — generates a random 32-byte token, returns both the raw token (emailed once) and its sha256 hash (the only thing persisted).
  - `User.hashResetToken(rawToken)` — sha256 hash helper, used to look up a token by its hash without ever storing the raw value.
  - `isResetTokenValid(tokenHash)` — checks hash match + expiry.
  - `toPublic()` — strips sensitive fields (`passwordHash`, reset token) before a `User` is ever serialized to a client.

### `domain/entities/CourseProgress.js`
- **Purpose:** Per-user, per-course progress (chapters completed + quiz results). Course *content* itself lives client-side (local JSON → WatermelonDB); this entity only tracks completion state, keyed by `courseSlug`.
- **Main functions:**
  - `CourseProgress.empty(userId, courseSlug)` — a zero-progress instance for a course the user hasn't touched yet.
  - `addCompletedChapter(chapterNumber)` — idempotent; keeps `chaptersCompleted` sorted and deduplicated.
  - `upsertQuizResult(chapterNumber, score, total)` — replaces any prior result for that chapter (latest attempt wins).
  - `assertValidChapterNumber` / `assertValidQuizResult` — static validation guards reused by use cases before they call the repository.
  - `toPublic()` — client-facing shape.

### `domain/entities/Attempt.js`
- **Purpose:** A single recorded test or diagnostic attempt (score + per-question answers). Shared by both `/test-attempts` and `/diagnostic-attempts` — `kind` (`"test"` | `"diagnostic"`) picks which slug field (`testSlug`/`diagnosticSlug`) applies.
- **Main functions:**
  - `Attempt.create({kind, userId, slug, score, total, durationSeconds, answers})` — validates `score`/`total`/`durationSeconds`, then normalizes the `answers` array via the internal `normalizeAnswers()` helper (checks each answer's `questionIndex` is in range and `correctKey`/`selectedKey` are one of `A/B/C/D`, and computes `isCorrect` per answer).
  - `percent` (getter) — `round(score/total*100)`.
  - `toPublic()` — client-facing shape, using the kind-specific slug field name.

### `domain/entities/OnboardingProfile.js`
- **Purpose:** A user's onboarding answers (goal, grade level, subjects, exam date, study schedule). One profile per user, full overwrite on save.
- **Main functions:**
  - `OnboardingProfile.create(userId, input)` — validates every field against fixed allowed-value lists (`GOALS`, `GRADES`, `MINUTES`, `SCHEDULES`, `EXAM_MODES`, `NOTIFICATIONS`), requires at least one subject and a parseable exam date.
  - `toPublic()` — client-facing shape.

### `domain/valueObjects/Email.js`
- **Purpose:** Email normalization/validation as a reusable value object rather than duplicated regex checks.
- **Main functions:** `normalizeEmail` (trim + lowercase), `isValidEmail` (regex check), `assertValidEmail` (both, throwing a field-specific `ValidationError` on failure). Used by `login`, `signup`, `checkAccountExists`, `requestPasswordReset`.

### `domain/errors.js`
- **Purpose:** Framework-agnostic error hierarchy. Nothing below `interfaces/http` knows what an HTTP status code is — only `errorHandler.js` maps these to one.
- **Classes:** `DomainError` (base — carries `.details`), `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ConflictError`.

### `domain/ports.js`
- **Purpose:** JSDoc-only contract definitions (plain JS has no `interface` keyword) for everything the application layer depends on but doesn't implement itself: `UserRepository`, `OnboardingRepository`, `ProgressRepository`, `AttemptRepository`, `PasswordHasher`, `TokenService`, `EmailSender`. `infrastructure/*` implements these by convention (each concrete module has an `@implements` JSDoc tag pointing back here). No runtime code — `module.exports = {}`.

---

## `application/use-cases/` — orchestration, depends only on `domain/`

Every use case here is a factory: `make<Thing>(deps) → async function(...) {}`. None of them import Express, Mongoose, or bcrypt directly — only the port shapes passed into them.

### `application/use-cases/auth/`
- **`checkAccountExists.js`** — `makeCheckAccountExists({userRepository})`. Step 1 of the login flow: does an account exist for this email? Returns `{exists, login_hint}` without revealing anything else.
- **`login.js`** — `makeLogin({userRepository, passwordHasher, tokenService})`. Step 2: validates email, loads the user *with* password hash, verifies the password via the entity, throws `UnauthorizedError` on any mismatch (same generic-enough messages either way), and issues a session on success.
- **`signup.js`** — `makeSignup({userRepository, passwordHasher, tokenService, emailSender})`. Validates password length (≥8 chars), hashes it, builds a `User` entity, checks for an existing account (`ConflictError` if found — the repository also catches the race via the unique-index error), persists it, fires-and-forgets a welcome email, and returns a session.
- **`requestPasswordReset.js`** — `makeRequestPasswordReset({userRepository, emailSender, frontendUrl, tokenTtlSeconds})`. Generates a reset token only if the account exists, but always returns `{ok: true}` regardless — deliberately avoids leaking whether an email is registered via response shape or timing.
- **`resetPassword.js`** — `makeResetPassword({userRepository, passwordHasher})`. Validates the token hash + expiry via `user.isResetTokenValid()`, hashes the new password, and updates it — the repository call also clears the reset-token fields so the link is single-use.
- **`issueSession.js`** — shared helper (not a use case itself) used by both `login` and `signup`: calls `tokenService.issue(user)` and shapes the response as `{access_token, refresh_token, expires_in, user: user.toPublic()}`.

### `application/use-cases/onboarding/`
- **`getOnboarding.js`** — `makeGetOnboarding({onboardingRepository})`. Straight passthrough: `onboardingRepository.findByUserId(userId)`.
- **`saveOnboarding.js`** — `makeSaveOnboarding({onboardingRepository})`. Builds an `OnboardingProfile` entity (which validates the input) and upserts it — one profile per user, full overwrite semantics.

### `application/use-cases/progress/`
- **`listProgress.js`** — `makeListProgress({progressRepository})`. All of a user's course-progress records.
- **`getCourseProgress.js`** — `makeGetCourseProgress({progressRepository})`. One course's progress, or `CourseProgress.empty(...)` if the user hasn't started it.
- **`markChapterComplete.js`** — `makeMarkChapterComplete({progressRepository})`. Validates the chapter number via the entity, then delegates to the repository's atomic `addCompletedChapter` (safe under concurrent requests for the same user).
- **`saveQuizResult.js`** — `makeSaveQuizResult({progressRepository})`. Validates chapter number + score/total via the entity, then delegates to the repository's atomic `upsertQuizResult`.

### `application/use-cases/attempts/`
- **`recordAttempt.js`** — `makeRecordAttempt({attemptRepository})`. Builds an `Attempt` entity (validates + normalizes answers) using `attemptRepository.kind` (`"test"`/`"diagnostic"`, set by the composition root), then persists it.
- **`listAttempts.js`** — `makeListAttempts({attemptRepository})`. All attempts for a user.
- **`listAttemptsForSlug.js`** — `makeListAttemptsForSlug({attemptRepository})`. A user's attempts for one specific test/diagnostic slug.

### `application/notifications/emailTemplates.js`
- **Purpose:** Plain HTML/text email bodies — no templating engine. Two builders: `welcomeEmail(user)` and `passwordResetEmail(user, resetUrl)`, each returning `{to, subject, html, text}` ready for `EmailSender.send()`.

---

## `infrastructure/` — concrete implementations of the domain ports

### `infrastructure/config/env.js`
- **Tech:** `dotenv`
- **Purpose:** Loads `backend/.env` and exports one `config` object with defaults for every environment variable (port, CORS origin, Mongo URI, token TTLs, Resend key, frontend URL). See `.env.example` at the repo root of `backend/` for the full variable list.

### `infrastructure/config/db.js`
- **Tech:** `mongoose`
- **Purpose:** MongoDB connection with retry logic.
- **Main function:** `connectDb({retries=5, delayMs=3000})` — retries transient connection failures (e.g. DNS blips on the SRV lookup) up to `retries` times before throwing, so a flaky network doesn't crash the whole process on one bad attempt.

### `infrastructure/logging/logger.js`
- **Purpose:** A tiny console-wrapping logger (`log`/`info`/`warn`/`error`/`debug`) that's a no-op unless `NODE_ENV=development` **and** `ENABLE_CONSOLE_LOGS=true` — keeps production/test output quiet by default while still being available for local debugging.

### `infrastructure/email/resendEmailSender.js`
- **Tech:** `resend`
- **Purpose:** Implements the `EmailSender` port. If `RESEND_API_KEY` isn't set (e.g. local dev), sends are skipped and logged instead of hitting the network. Never throws/rejects — errors from Resend are caught and logged, matching the port contract so use cases can fire-and-forget without `try/catch`.

### `infrastructure/security/bcryptPasswordHasher.js`
- **Tech:** `bcryptjs`
- **Purpose:** Implements the `PasswordHasher` port. `hash(plain)` → `bcrypt.hash(plain, 10)` (cost factor 10); `verify(plain, hash)` → `bcrypt.compare`.

### `infrastructure/security/stubTokenService.js`
- **Purpose:** Implements the `TokenService` port with an **opaque stub**, not a real JWT — it base64url-encodes the user's email into a token shaped `stub.<base64url(email)>.access`, and `decodeEmail()` reverses it. This is a placeholder until a real token/GraphQL-backed implementation replaces it (called out explicitly in the file's own comment) — swapping it only requires a change in `composition/container.js`, nothing else.

### `infrastructure/persistence/mongoose/schemas/`
Mongoose schema/model definitions — the only files that know MongoDB's document shape.
- **`user.schema.js`** — `email` (unique, lowercase, indexed), `phone`, `name`, `organization`, `passwordHash` (`select: false` — excluded from queries unless explicitly requested), `loginHint`, `passwordResetTokenHash`/`passwordResetTokenExpiresAt` (also `select: false`).
- **`courseProgress.schema.js`** — `user` ref, `courseSlug` (indexed), `chaptersCompleted: [Number]`, `quizResults: [{chapterNumber, score, total, takenAt}]`, `lastChapterNumber`. Compound unique index on `{user, courseSlug}` — one progress document per user per course.
- **`onboardingProfile.schema.js`** — `user` ref (unique — one profile per user) plus every onboarding field, with `enum` constraints mirroring the domain entity's allowed-value lists.
- **`attempt.schema.js`** — exports `makeAttemptModel(modelName, slugField)`, a **factory** (not a fixed model) so `TestAttempt`/`DiagnosticAttempt` share one schema definition but end up as two distinct Mongoose models/collections (`testattempts`/`diagnosticattempts`), differing only in which field holds the slug (`testSlug` vs `diagnosticSlug`) — preserved exactly to avoid a data migration from the pre-refactor schema.

### `infrastructure/persistence/mongoose/repositories/`
Each file implements one repository port, translating between Mongoose documents and domain entities via a private `toEntity()` mapper — nothing above this layer ever sees a raw Mongo document.
- **`mongoUserRepository.js`** — implements `UserRepository`. `findByEmail`, `findByEmailWithPasswordHash` (explicitly `.select("+passwordHash")` since it's excluded by default), `create` (translates a MongoDB duplicate-key error, code `11000`, into a domain `ConflictError`), `findByResetTokenHash`, `setResetToken`, `updatePassword` (also clears the reset token fields).
- **`mongoProgressRepository.js`** — implements `ProgressRepository`. `listByUser`, `findOne`, `addCompletedChapter` (atomic `$addToSet` + `$set`, upserting the document if it doesn't exist yet), `upsertQuizResult` (atomic `$pull` then `$push` to replace one chapter's result without affecting others) — both writes are safe under concurrent requests for the same user.
- **`mongoOnboardingRepository.js`** — implements `OnboardingRepository`. `findByUserId`, `upsert` (`findOneAndUpdate` with `upsert: true` — full overwrite per user).
- **`mongoAttemptRepository.js`** — exports `makeMongoAttemptRepository(kind)`, a factory bound to `"test"` or `"diagnostic"` at composition time; internally picks the right Mongoose model (via `makeAttemptModel`) and slug field. Implements `listByUser`, `listByUserAndSlug`, `create`.

---

## `interfaces/http/` — Express adapters, depends on `application/`

### `interfaces/http/asyncHandler.js`
- **Purpose:** Wraps an async route handler so a rejected promise is forwarded to Express's error middleware (`next(err)`) instead of crashing the process. Every controller method is wrapped in this.

### `interfaces/http/middleware/errorHandler.js`
- **Purpose:** The single seam where domain errors become HTTP responses.
- **Main functions:**
  - `notFound(req, res, next)` — turns any unmatched route into a `NotFoundError`, passed to the error handler below (mounted last in `app.js`).
  - `errorHandler(err, req, res, next)` — maps error class → status code via a lookup table (`ValidationError`→400, `UnauthorizedError`→401, `NotFoundError`→404, `ConflictError`→409, anything else→500). 500s are logged server-side; their message is hidden from the client (`"Internal server error."`) so internals never leak. Anything below 500 is considered safe to expose (`err.message` + optional `err.details`, e.g. which form field failed validation).

### `interfaces/http/middleware/requireAuth.js`
- **Purpose:** Auth gate for protected routes.
- **Main function:** `makeRequireAuth({tokenService, userRepository})` returns an `asyncHandler`-wrapped middleware that reads the `Authorization: Bearer <token>` header, decodes the email via the injected `TokenService`, loads the `User` via the injected `UserRepository`, and attaches it as `req.user`. Throws `UnauthorizedError` for a missing header, invalid token, or a user that no longer exists.

### `interfaces/http/controllers/`
Thin adapters — pull request fields, call an already-built use case, serialize the response. No business logic lives here.
- **`auth.controller.js`** — `makeAuthController({checkAccountExists, login, signup, requestPasswordReset, resetPassword})`. Handlers: `accountExists`, `login`, `signup` (201 on success), `forgotPassword`, `resetPassword`.
- **`onboarding.controller.js`** — `makeOnboardingController({saveOnboarding, getOnboarding})`. Handlers: `save` (`POST /onboarding`), `get` (`GET /onboarding`) — both scoped to `req.user.id` from `requireAuth`.
- **`progress.controller.js`** — `makeProgressController({listProgress, getCourseProgress, markChapterComplete, saveQuizResult})`. Handlers: `list`, `detail`, `complete`, `submitQuiz`. Includes a local `chapterParam(req)` helper that parses/validates `req.params.chapter` as a positive integer before it reaches the use case.
- **`attempt.controller.js`** — `makeAttemptController({recordAttempt, listAttempts, listAttemptsForSlug})`. Shared by both `/test-attempts` and `/diagnostic-attempts` — the underlying use cases already know which `kind` they're bound to via composition. Handlers: `list`, `listForSlug`, `create` (201 on success).

### `interfaces/http/routes/`
Pure URL/verb → controller-method wiring, no logic.
- **`index.js`** — `makeRoutes({...controllers, requireAuth})`. Mounts `GET /health` inline, then `/auth`, `/onboarding`, `/progress`, `/test-attempts`, `/diagnostic-attempts` via the feature-specific route files below.
- **`auth.routes.js`** — `POST /account-exists`, `/login`, `/signup`, `/forgot-password`, `/reset-password`. No `requireAuth` (these are the only public, unauthenticated endpoints).
- **`onboarding.routes.js`** — `router.use(requireAuth)` then `GET /` and `POST /`.
- **`progress.routes.js`** — `router.use(requireAuth)` then `GET /`, `GET /:slug`, `POST /:slug/chapters/:chapter/complete`, `POST /:slug/chapters/:chapter/quiz`.
- **`attempt.routes.js`** — `router.use(requireAuth)` then `GET /`, `GET /:slug`, `POST /:slug`. Mounted twice in `routes/index.js` — once at `/test-attempts` with the test controller, once at `/diagnostic-attempts` with the diagnostic controller — same route shape, different injected controller/repository `kind`.

---

## `composition/container.js` — the composition root

- **Purpose:** The one file allowed to import from both `infrastructure/*` and `application/*`/`interfaces/*` in the same place (enforced by convention, called out in the file's header comment). Wires everything: instantiates concrete infrastructure → injects it into use-case factories → injects use cases into controller factories → returns a fully-wired Express `Router`.
- **Main function:** `buildRoutes()` — called once from `app.js`. Also contains `buildAttemptController(kind)`, a local helper that builds one attempt repository + its three use cases + controller for a given `kind` (`"test"` or `"diagnostic"`), called twice to produce the two attempt controllers.

---

## `test/` — unit tests (`node:test`, run via `npm test`)

All tests exercise `domain/` and `application/` code directly, with hand-written in-memory fakes standing in for repositories/services — no MongoDB, no HTTP server, no network calls.

- **`test/domain/user.test.js`** — reset-token generation, hashing, and expiry/validity checks on the `User` entity.
- **`test/domain/courseProgress.test.js`** — chapter-completion sorting/dedup/idempotency, quiz-result upsert-by-chapter, validation errors for bad input.
- **`test/application/signup.test.js`** — full signup flow against fake `userRepository`/`passwordHasher`/`tokenService`/`emailSender`: successful signup, short-password rejection, duplicate-email rejection, welcome-email side effect.
- **`test/application/requestPasswordReset.test.js`** / **`resetPassword.test.js`** — the forgot/reset password use cases, including the "always return `{ok:true}`" non-leaking behavior and single-use token semantics.
- **`test/application/recordAttempt.test.js`** — answer normalization, percent calculation, and validation (score > total, invalid answer key) on the `recordAttempt` use case.

---

## Configuration files

- **`package.json`** — scripts: `start` (`node src/index.js`), `dev` (`node --watch src/index.js`, auto-restart on file change), `test` (`node --test`, Node's built-in test runner — no external test framework).
- **`.env.example`** — documents every environment variable consumed by `infrastructure/config/env.js` (`NODE_ENV`, `PORT`, `CORS_ORIGIN`, `MONGODB_URI`, `GRAPHQL_ENDPOINT`, `ACCESS_TOKEN_TTL_SECONDS`, `RESEND_API_KEY`, `EMAIL_FROM`, `FRONTEND_URL`, `PASSWORD_RESET_TOKEN_TTL_SECONDS`). Copy to `.env` and adjust for local development.
