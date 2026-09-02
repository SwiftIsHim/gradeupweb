# GradeUp — Project Breakdown

Prepared for a deep-dive walkthrough: *"Understand what you built. Explain both the
technical and product aspect. Go deep — explain why you chose certain tools,
methods, and practices."*

Suggested pacing for a 60-minute session:

| Time | Section |
|---|---|
| 0:00–0:10 | Product (§1) |
| 0:10–0:15 | System architecture at a glance (§2) |
| 0:15–0:30 | Backend deep dive (§4) |
| 0:30–0:45 | Frontend deep dive (§5) |
| 0:45–0:50 | Data & content strategy (§6) + Security (§7) |
| 0:50–0:55 | CI/CD (§8) |
| 0:55–1:00 | Known gaps / roadmap (§9) — shows what you already know is unfinished |

---

## 1. Product

**GradeUp** is an exam-prep platform for the **Philippine Civil Service Commission
(CSC) exams** — promotion, confirmation, and conversion exams that government
employees take to move up grade levels (Grade 6 through Grade 10+).

**The problem:** civil servants preparing for these exams don't have a single,
structured place to study — content is scattered (PDFs of CSC law, memorized
past questions), there's no way to gauge readiness, and no lightweight way to
drill practice questions on a phone between shifts.

**The product's answer:**

1. **Onboarding (8 steps)** — captures why the user is studying (promotion /
   confirmation / conversion / general), their current grade level, subjects of
   focus (Constitution, Public Service Rules, Financial Regulations, Public
   Administration, Current Affairs, Office Communication), exam date, and a daily
   study-time goal. This isn't just a form — it drives what the dashboard shows
   and (eventually) the study plan.
2. **Courses** — chapter-based study material (e.g. *Civil Service Laws and
   Ethics*) with reading, learning objectives, key terms, flashcards, and a
   per-chapter quiz.
3. **Tests** — timed practice tests pulled from a real civil-service question
   bank (`frontend/Tests/civil_service_questions.json`), graded instantly,
   attempts saved.
4. **Diagnostics** — a single "where do you stand" assessment merged from
   multiple question-bank files, meant to be taken once up front.
5. **Dashboard** — a **readiness score** (average of test performance and the
   diagnostic score), progress across courses, and quick links back into
   whatever the user was doing.
6. **Peers** — scaffolded but not yet real (see §9) — the intent is
   study-group/social accountability features.

**Core user journey:**

```
Landing page → email-first login/signup → onboarding (8 steps) →
dashboard → courses / tests / diagnostics → progress + readiness score
```

The **email-first auth flow** (borrowed from products like Slack/Notion) is a
deliberate product choice, not just a technical one: the user types an email
first; the backend tells the frontend whether an account exists; the UI then
branches to a password field (returning user) or a signup form (new user) —
one fewer decision for the user ("log in" vs "sign up" buttons removed
entirely).

---

## 2. System architecture at a glance

There are effectively **two backends**, each with a different job:

```
┌─────────────────────────── Browser ───────────────────────────┐
│                                                                 │
│   Next.js Client (React 19)                                    │
│     │                                                           │
│     ├─► WatermelonDB (IndexedDB, via LokiJS)                    │
│     │     "content" — courses, chapters, quiz banks,            │
│     │     diagnostic questions. Seeded once from local JSON,    │
│     │     then read instantly, offline, with zero network.      │
│     │                                                           │
│     └─► fetch("/api/...")  (same-origin, cookie-based)          │
│           "state" — auth, onboarding, progress, attempts        │
└──────────────────────────────┬──────────────────────────────────┘
                                │
                     Next.js Route Handlers (BFF)
                     httpOnly cookies hold the token;
                     the browser JS never sees it
                                │
                     server-to-server fetch (BACKEND_URL)
                                │
                                ▼
                   Express API — Clean Architecture
                   interfaces → application → domain
                          ▲
                   infrastructure (Mongoose, bcrypt,
                   Resend, stub tokens)
                                │
                                ▼
                            MongoDB
                (accounts, onboarding profiles,
                 course progress, test/diagnostic attempts)
```

**Why split it this way:** course/test content is large, static, and identical
for every user — there's no reason to make a network round trip to Express/Mongo
every time someone opens a chapter. Only genuinely *per-user, mutable* state
(who they are, what they've completed, what they scored) goes through the
backend. This single decision shapes almost everything else described below.

---

## 3. Repo layout

```
GradeUpWeb/
├─ backend/                Express API — Clean Architecture
│  ├─ src/
│  │  ├─ domain/           entities, value objects, errors, port contracts
│  │  ├─ application/      use-cases (one file per business operation)
│  │  ├─ infrastructure/   Mongoose, bcrypt, Resend, config, logging
│  │  ├─ interfaces/http/  Express controllers, routes, middleware
│  │  └─ composition/      the one file that wires it all together
│  ├─ test/                node:test unit tests (domain + application)
│  └─ docs/                ARCHITECTURE.md, FILE_REFERENCE.md (already written)
│
├─ frontend/                Next.js 16 App Router
│  ├─ app/                  routes + Route Handlers (the BFF layer)
│  ├─ src/<feature>/         model / view / viewmodel / repository / data — per feature
│  ├─ courses/, Tests/, Diagnostics_Test/   local JSON study content
│  ├─ components/ui/        shadcn-style UI primitives (Radix + Tailwind)
│  └─ lib/                  cookies, logging, Sentry error reporting
│
└─ .github/workflows/       ci.yml, deploy.yml
```

---

## 4. Backend deep dive — Clean (Hexagonal) Architecture

The backend follows the **Dependency Rule**: source-code dependencies point
only *inward*. Business logic (`domain/`, `application/`) never imports
Express, Mongoose, or bcrypt — it only calls **ports** (interfaces defined in
`domain/ports.js`). Concrete implementations of those ports live in
`infrastructure/`, and one file — `composition/container.js` — is the only
place allowed to wire a concrete infrastructure module into a use case.

```
interfaces/http/  →  application/use-cases/  →  domain/
                                                     ▲
                            infrastructure/ ─────────┘
                     (composition/container.js wires it all)
```

### Why this architecture, specifically here

This isn't resume-driven-development on a toy CRUD app — it's a direct answer
to a real constraint: **the backend's own code comments say the current
Mongo-backed auth is a placeholder for the real Civilpromo GraphQL API**
(`GRAPHQL_ENDPOINT` is already a config value; `stubTokenService.js` says so
explicitly). The team doesn't yet know exactly when or how that swap happens.
Clean Architecture means that swap touches `infrastructure/security/` and one
line in `container.js` — `domain/` and `application/` (where the actual
business rules live) don't change at all. The architecture is bought
specifically so a known, upcoming rewrite is cheap.

### The five groupings

- **`domain/`** — zero dependencies, pure JS. Entities carry their own
  invariants so an invalid object can't exist: `User.create()` rejects a
  non-E.164 phone number or a missing password hash at construction time;
  `CourseProgress` keeps `chaptersCompleted` sorted/deduplicated as a class
  invariant instead of trusting every caller to do it; `Attempt.create()`
  validates and normalizes quiz answers (`A/B/C/D` keys, bounds-checked
  indices) in one place. `domain/ports.js` is JSDoc-only — plain JS has no
  `interface` keyword — but it's the contract (`UserRepository`,
  `PasswordHasher`, `TokenService`, `EmailSender`, …) everything else codes
  against.
- **`application/use-cases/`** — one file per business operation
  (`login.js`, `signup.js`, `markChapterComplete.js`, `recordAttempt.js`, …),
  grouped by feature. Each is a factory: `makeLogin({userRepository,
  passwordHasher, tokenService}) → async function login(...)`. This is
  **manual dependency injection** — no DI framework/container library, because
  at this scale one composition root is easier to read and debug than
  reflection-based magic.
- **`infrastructure/`** — the only layer that knows Mongoose/bcrypt/Resend
  exist. Repositories map raw Mongo documents to domain entities via a private
  `toEntity()` — nothing above this layer ever sees a Mongoose document shape.
- **`interfaces/http/`** — thin Express adapters. Controllers pull fields off
  `req.body`, call an already-built use case, call `res.json()`. **Zero
  business logic** — delete every `if` in a controller and nothing in the
  domain breaks.
- **`composition/container.js`** — instantiates infra → injects into use
  cases → injects use cases into controllers → returns a wired Express
  `Router`, mounted once by `app.js`.

### Error handling

Domain code throws semantic errors (`ValidationError`, `UnauthorizedError`,
`NotFoundError`, `ConflictError`) that know nothing about HTTP. **One file**,
`interfaces/http/middleware/errorHandler.js`, maps error class → status code
(400/401/404/409, everything else → 500 with the message hidden from the
client). This means no scattered `try/catch` throughout the codebase, and one
guaranteed place where "does this leak internals to the client?" is decided.

### Testing strategy

`backend/test/` uses Node's **built-in `node:test`** runner — no Jest/Mocha —
run via `npm test`. Because `domain/` and `application/` never import
Mongoose/Express, the tests exercise real business logic against **hand-written
in-memory fakes** for repositories/services: no MongoDB, no HTTP server, no
network, so they run in milliseconds. Covered: password-reset token lifecycle,
`CourseProgress` invariants, full signup flow (including the "email already
taken" and "password too short" branches and the welcome-email side effect),
answer normalization/grading in `recordAttempt`.

*(Why `node:test` instead of Jest: zero extra dependency to install/configure,
ships with Node, and the layer under test doesn't need Jest's mocking/snapshot
machinery — plain function fakes are enough.)*

### Security specifics worth calling out

- **bcryptjs** (pure JS, cost factor 10) instead of native `bcrypt` — no
  native build step, so `npm install` and CI/deploy stay simple across
  platforms.
- `passwordHash` and reset-token fields are `select: false` in the Mongoose
  schema — excluded from every query by default; you have to opt in
  (`.select("+passwordHash")`) to ever see them.
- Password reset: a random 32-byte token is emailed once; only its **SHA-256
  hash** is persisted, with a TTL, and it's cleared on use (single-use link).
- `requestPasswordReset` **always returns `{ok: true}`**, whether or not the
  email is registered — deliberately prevents an attacker from using the
  endpoint to enumerate valid accounts.
- Signup's duplicate-email check is backed by a **unique Mongo index**, not
  just an application-level check — the repository translates the resulting
  `E11000` error into a domain `ConflictError`, so a race between two
  concurrent signups for the same email can't create two accounts.
- CORS is locked to a single configured origin (`CORS_ORIGIN`), not `*`.

### Known, explicitly-flagged stub

`infrastructure/security/stubTokenService.js` issues an **opaque token**
shaped `stub.<base64url(email)>.access` — not a JWT, not backed by the real
identity provider yet. It exists so the whole login → session → protected
route flow works end-to-end today. Swapping it for the real thing is
contained to that one file plus one line in `container.js`.

---

## 5. Frontend deep dive — Next.js App Router + feature-slice MVVM

**Stack:** Next.js 16 (App Router, React 19, Turbopack), TypeScript, Tailwind
CSS v4, shadcn-style components on Radix primitives.

### Feature-slice pattern

Every product area (`login`, `onboarding`, `dashboard`, `courses`, `tests`,
`diagnostics`, `peers`, `landing-page`, `forgot-password`, `reset-password`)
is organized under `frontend/src/<feature>/` with the **same shape**:

| Folder | Role |
|---|---|
| `model/` | Static content + TypeScript types — copy, option lists, config. Kept out of components so UI text isn't buried in JSX. |
| `view/` | Presentational `.tsx` components — render props, no business logic. |
| `viewmodel/` | Client hooks (`useLoginFormViewModel`, `useOnboardingViewModel`, …) that own state, side effects, and orchestration — the "VM" in MVVM. |
| `repository/` / `data/` | Data-fetching — calls **Next.js route handlers**, never the Express backend directly from the browser. |
| `db/` *(courses, tests only)* | WatermelonDB schema/models/queries/seed. |

This is a deliberate convention, not organic growth — it means any teammate
can predict where to find "the copy for onboarding step 3" (`model/`) vs "what
happens when you submit the login form" (`viewmodel/`) without reading every
file. It also keeps components thin and easy to test/reason about in
isolation, even though there's no test suite exercising them yet (see §9).

### Route handlers as a Backend-for-Frontend (BFF)

The browser **never calls the Express API directly** and never sees an access
token. Instead:

1. A client viewmodel calls a same-origin Next.js route, e.g.
   `POST /api/auth/login`.
2. The route handler (`app/api/auth/login/route.ts`) calls a **server-only**
   repository (`accountRepository.ts`, marked `import "server-only"`) which
   does the real `fetch` to `BACKEND_URL` (Express).
3. On success, the handler sets `httpOnly`, `sameSite=lax`, and (in
   production) `secure` cookies via `lib/auth/cookies.ts` — the access/refresh
   tokens live only in cookies the browser's JavaScript cannot read.
4. Any `BackendError` (expected — bad password, validation, duplicate email)
   is translated into the right HTTP status for the client. Anything
   *unexpected* is reported to Sentry via `reportUnexpectedError()` and
   returned as a generic 500 — so a bug in this layer never leaks a stack
   trace or crashes silently.

**Why a BFF instead of calling Express straight from the browser:** it keeps
tokens out of client-side JS entirely (meaningfully reduces XSS blast radius
compared to `localStorage` tokens), and it gives one seam where every backend
call is logged/error-handled consistently instead of that logic being
duplicated in every component that needs data.

### WatermelonDB — local-first content

Course chapters, quiz question banks, and the diagnostic question bank are
**not** fetched from Express/Mongo on every page view. Instead:

1. Content is authored as JSON and lives in the repo
   (`frontend/courses/*.json`, `frontend/Tests/*.json`,
   `frontend/Diagnostics_Test/*.json`).
2. A Next.js route (e.g. `/api/courses/content`) reads that JSON off disk
   once and serves it.
3. The browser seeds it into **WatermelonDB** (`@nozbe/watermelondb`, using
   the **LokiJS adapter over IndexedDB** — no native SQLite build needed on
   web).
4. From then on, opening a chapter or a quiz question is a **synchronous
   local database query** — instant, works offline, and puts zero load on the
   backend for content that's identical for every user anyway.

Implementation details worth knowing:

- WatermelonDB must never run during Next.js server rendering, so the LokiJS
  adapter is **dynamically imported** and guarded behind a `typeof window`
  check (`getDatabase()` rejects outside the browser).
- WatermelonDB columns are scalar-only, so nested structures (chapter
  sections, quiz options) are stored as **JSON strings in `string` columns**
  and parsed back out by the model classes.
- `next.config.ts` sets `transpilePackages: ["@nozbe/watermelondb"]` because
  the package ships partly-untranspiled modern JS that needs to go through
  Next's compiler to bundle cleanly under Turbopack.
- `next.config.ts` also sets `outputFileTracingIncludes` for
  `/api/courses/content` and `/api/tests/content`, because those routes read
  JSON off disk at runtime (`readdir`/`readFile`) — an access pattern
  Vercel's static analysis can't see, so without this the JSON folders
  wouldn't get bundled into the deployed serverless function and content
  would come up empty in production. *(Note: `/api/diagnostics/content` does
  the same disk read but is **not** in this list — see §9, this looks like a
  real gap.)*

### Theme system

CSS custom properties (`bg-card`, `bg-background`, `text-foreground`, …)
define light/dark tokens. An inline script in `app/layout.tsx` applies the
`.dark` class to `<html>` **before first paint**, based on `localStorage` /
system preference, so there's no flash of the wrong theme on load.
`ThemeProvider` then mirrors that into React context and writes back to the
DOM + `localStorage` when the user toggles it.

### Observability

`@sentry/nextjs` is wired for all three Next.js runtimes — client
(`instrumentation-client.ts`), server (`sentry.server.config.ts`), and edge
(`sentry.edge.config.ts`) — loaded through the `register()` hook in
`instrumentation.ts`. Two patterns keep it consistent:

- `reportUnexpectedError(error, {route})` — a one-line helper every route
  handler's catch-all calls, so *only* truly unexpected failures reach Sentry
  (expected `BackendError`s are handled separately and don't spam the error
  tracker).
- `Sentry.setUser(...)` is called at both the auth route handlers (server
  side, right after login/signup) and the login viewmodel (client side) so
  every subsequent error — client or server — is attributed to a user.

### UI kit

`components/ui/` follows the **shadcn** model: components are generated
into the repo (not installed as an opaque dependency), built on **Radix**
primitives (accessible, unstyled behavior) styled with Tailwind, and composed
with `class-variance-authority` + `tailwind-merge` for variant props. This
trades a slightly bigger repo for full control over every component's markup
and styling — no fighting an npm package's internals to make a one-off change.

---

## 6. Data & content strategy — the split in one table

| Data | Source of truth | Runtime home | Touches Express/Mongo? |
|---|---|---|---|
| Course/chapter/flashcard content | `frontend/courses/*.json` (git) | WatermelonDB (browser) | No |
| Practice test question banks | `frontend/Tests/*.json` (git) | WatermelonDB (browser) | No |
| Diagnostic question bank | `frontend/Diagnostics_Test/*.json` (git) | WatermelonDB (browser) | No |
| User accounts | MongoDB | Backend | Yes |
| Onboarding profile | MongoDB | Backend | Yes |
| Per-course progress (chapters done, quiz scores) | MongoDB | Backend | Yes |
| Test / diagnostic attempts | MongoDB | Backend | Yes |

The rule of thumb: **if it's the same for every user, it's content and lives
client-side; if it's specific to one user and must be authoritative across
devices, it's state and lives on the backend.**

---

## 7. Security posture (summary)

- Passwords hashed with bcrypt (cost 10); hash field excluded from queries by default.
- Sessions delivered as `httpOnly` + `sameSite=lax` (+ `secure` in prod) cookies — never exposed to browser JS.
- Password-reset tokens: random, single-use, TTL-bound, only their hash persisted.
- Forgot-password endpoint gives a uniform response regardless of account existence (anti-enumeration).
- Signup duplicate-email race handled at the DB unique-index level, not just app logic.
- CORS restricted to one configured origin.
- 500-level errors hide their message from the client and are logged/sent to Sentry server-side; 4xx errors are considered safe to expose (validation messages, which field failed, etc.).

---

## 8. CI/CD

**`ci.yml`** — on every push/PR to `main`/`master`, two parallel jobs:
- `frontend`: `npm ci` → `npm run lint` → `npm run build` (Node 24.15, npm-cached by lockfile).
- `backend`: `npm ci` only.

**`deploy.yml`** — triggered by `ci.yml` completing successfully on `main`/`master`
(`workflow_run`), or manually (`workflow_dispatch`):
- **Frontend → Vercel**: `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`, authenticated via org/project/token secrets.
- **Backend → Render**: a single `curl` to Render's deploy-hook API, which pulls and rebuilds server-side.

Both deploy jobs gate on CI success, so a broken lint/build never reaches production automatically.

---

## 9. Known gaps, deliberate tradeoffs, and roadmap

Worth raising these proactively — they show you understand the system's edges, not just its happy path.

- **Backend tests aren't run in CI.** `backend/test/` has 6 files and passes locally (`npm test`), but `ci.yml`'s `backend` job only runs `npm ci` — no `npm test` step. Quick, low-risk fix.
- **No frontend test suite yet.** No `*.test.ts(x)` files exist under `frontend/`. Viewmodels are structured to be testable in isolation (pure hooks with clear inputs/outputs), but nothing currently exercises them.
- **Likely production gap:** `next.config.ts`'s `outputFileTracingIncludes` whitelists `/api/courses/content` and `/api/tests/content` for Vercel's serverless bundling, but not `/api/diagnostics/content` — even though that route reads `Diagnostics_Test/*.json` off disk the same way. On Vercel this could silently serve an empty diagnostic (the route's own fallback is `{version: "empty", tests: []}` on a failed read, so it fails quiet, not loud).
- **`stubTokenService` is not a real token/JWT system** — an intentional placeholder documented in the code itself, waiting on the real Civilpromo GraphQL identity API. Isolated behind the `TokenService` port so the swap is contained.
- **No automated Clean Architecture boundary enforcement** (e.g. a dependency-cruiser or ESLint import-boundary rule). The layering is real and consistently followed, but currently upheld by convention and code review, not tooling — flagged explicitly in `backend/docs/ARCHITECTURE.md` as a possible follow-up.
- **`backend/README.md` is stale** — it still describes the pre-Clean-Architecture, in-memory-store version of the service (says "OTP not implemented", references `services/auth.service.js`, which no longer exists post-migration). `backend/docs/ARCHITECTURE.md` and `FILE_REFERENCE.md` are the current, accurate docs.
- **Phone number is collected but not verified** — OTP verification was intentionally scoped out of the MVP signup flow (per the code's own comments); the field exists for future use.
- **Peers is scaffolded, not real.** `model/view/viewmodel` exist under `src/peers/`, but `SAMPLE_PEERS` is a hardcoded empty array — there's no backend support for it yet.
- **Dashboard's "Continue learning" / "Today's goal" widgets are explicit placeholders** — the code comments in `src/dashboard/model/dashboard.ts` say as much; they're not wired to real study data yet.
- **`book.json` at the repo root** looks unrelated to the product (a generic book/library sample dataset) — likely leftover scaffolding/test fixture worth removing or explaining if it's still needed for something.

---

## 10. Tech stack — quick "why this" reference

| Tool | Category | Why it was chosen |
|---|---|---|
| Next.js (App Router) | Frontend framework | File-based routing matches the product's information architecture directly (dashboard/courses/tests/diagnostics as nested routes); Route Handlers double as the BFF layer without a separate server. |
| React 19 / TypeScript | UI + types | Standard, type safety catches shape mismatches between viewmodels/views/repositories across ~10 feature slices. |
| Tailwind CSS v4 + shadcn/Radix | Styling/UI kit | Radix gives accessible unstyled behavior; shadcn's copy-into-repo model keeps every component fully editable instead of fighting a package's internals; Tailwind keeps styling co-located and themeable via CSS custom properties. |
| WatermelonDB (LokiJS/IndexedDB adapter) | Client-side local database | Course/test content is large, static, and identical per user — reading it locally is instant, works offline, and removes load from the backend entirely. |
| Express 5 | Backend HTTP framework | Minimal, unopinionated — fits a small, explicit Clean Architecture where the framework is meant to be a thin, replaceable edge, not the center of the app. |
| MongoDB / Mongoose | Backend datastore | Flexible document schema for evolving per-user state (progress, attempts, onboarding answers) without frequent migrations; Mongoose gives schema validation + a place to enforce uniqueness (email, one-progress-doc-per-course). |
| bcryptjs | Password hashing | Pure JS — no native build step, simpler cross-platform installs/CI/deploys than native `bcrypt`. |
| Resend | Transactional email | Simple API for welcome/reset emails; the `EmailSender` port is designed to never throw, so email delivery can never block or fail a request. |
| `node:test` | Backend testing | Built into Node — zero extra dependency — sufficient because business logic is tested with hand-written fakes, not real infrastructure. |
| Sentry (`@sentry/nextjs`) | Observability | One SDK covers client, server, and edge runtimes in Next.js; `reportUnexpectedError` + `Sentry.setUser` keep error attribution consistent across the whole app. |
| GitHub Actions | CI/CD | Free for this repo size, integrates natively with the GitHub-hosted source; `workflow_run` chains deploy after CI without duplicating build steps. |
| Vercel / Render | Hosting | Vercel is the default target for Next.js (App Router, serverless functions, edge runtime all first-class); Render offers simple deploy-hook-triggered redeploys for a small standalone Express service. |

---

## 11. Anticipated questions

- *"Why Clean Architecture for a project this size?"* → §4, specifically: the
  backend explicitly expects to swap Mongo-backed auth for the real Civilpromo
  GraphQL API later; the architecture makes that a two-file change instead of
  a rewrite.
- *"How do you keep tokens safe from XSS?"* → §5, BFF section — tokens never
  reach browser JS; they live only in `httpOnly` cookies set server-side.
- *"What happens if the backend is down?"* → course/test *content* keeps
  working (it's local to the browser); only *progress/attempts* calls would
  fail, and the progress client degrades a 401 to "no progress" rather than
  throwing so the page still renders (see `progressClient.ts`).
- *"What's not done yet?"* → §9, answer directly and specifically rather than
  vaguely — it reads as more credible than claiming everything is finished.
- *"How do you test this?"* → §4 (backend, `node:test` + fakes) — and be
  upfront that the frontend has no test suite yet.
