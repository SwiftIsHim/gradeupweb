# Backend Architecture

The backend (`backend/src`) follows **Clean Architecture** (a.k.a. Onion/Hexagonal
Architecture). The core rule is the **Dependency Rule**: source code dependencies
only point *inward*, toward the domain. Outer layers (HTTP, databases, third-party
APIs) may depend on inner layers, but inner layers never import anything from an
outer layer.

This means business rules — how a login works, how course progress is tracked —
don't know Express or Mongoose exist. Swap MongoDB for Postgres, or Express for
Fastify, and the domain/application code doesn't change.

```
interfaces/  →  application/  →  domain/
     ↑                                ↑
infrastructure/ ───────────────────────
              (composition/ wires everything together)
```

## The five groupings

### 1. `domain/` — Entities & business rules (innermost, zero dependencies)

The only layer with **no imports from anywhere else in the app** — pure JS/Node
standard library only.

- **`domain/entities/`** — `User`, `CourseProgress`, `OnboardingProfile`, `Attempt`.
  Plain classes holding data *and* the invariants that must always hold. E.g.
  [`User.js`](../src/domain/entities/User.js) rejects a non-E.164 phone number at
  construction time — it's impossible to have an invalid `User` object anywhere in
  the system. [`CourseProgress.js`](../src/domain/entities/CourseProgress.js) keeps
  `chaptersCompleted` sorted/deduplicated as a class invariant, not something every
  caller has to remember to do.
- **`domain/valueObjects/Email.js`** — normalization + validation for a primitive
  that needs rules attached to it (trim, lowercase, format check), reused by both
  `login` and `signup` instead of duplicated.
- **`domain/errors.js`** — `ValidationError`, `NotFoundError`, `UnauthorizedError`,
  `ConflictError`. Framework-agnostic — nothing here knows what an HTTP status code
  is.
- **`domain/ports.js`** — this is the file that makes the architecture "clean." It's
  JSDoc-only (plain JS has no `interface` keyword), but it defines the *contracts*
  — `UserRepository`, `PasswordHasher`, `TokenService`, `EmailSender` — that outer
  layers must implement. The application layer codes against these shapes, never
  against Mongoose or bcrypt directly.

### 2. `application/use-cases/` — Orchestration (depends only on `domain/`)

One file per business operation, grouped by feature (`auth/`, `progress/`,
`attempts/`, `onboarding/`). Each is a factory function that takes its dependencies
as an object (constructor injection) and returns the actual use-case function.

[`login.js`](../src/application/use-cases/auth/login.js) is the clearest example:

```js
function makeLogin({ userRepository, passwordHasher, tokenService }) {
  return async function login(rawEmail, rawPassword) {
    const email = assertValidEmail(rawEmail);          // domain value object
    const user = await userRepository.findByEmailWithPasswordHash(email);
    if (!user) throw new UnauthorizedError(...);        // domain error
    const ok = await user.verifyPassword(rawPassword, passwordHasher); // domain entity
    if (!ok) throw new UnauthorizedError(...);
    return issueSession(user, tokenService);
  };
}
```

Notice: it never imports Mongoose, bcrypt, or a JWT library — it only calls methods
on whatever `userRepository` / `passwordHasher` / `tokenService` objects it was
handed. This is what lets `backend/test/application/*.test.js` unit-test business
logic with fake in-memory repositories instead of spinning up MongoDB.

### 3. `infrastructure/` — Concrete implementations of the ports

Depends on `domain/`, implements its contracts. This is where real frameworks live:

- **`infrastructure/persistence/mongoose/`** — `schemas/` (Mongoose schema
  definitions) and `repositories/` (the actual repository implementations).
  [`mongoUserRepository.js`](../src/infrastructure/persistence/mongoose/repositories/mongoUserRepository.js)
  is the concrete answer to the `UserRepository` contract declared in `ports.js`: it
  runs the Mongoose query, then maps the raw Mongo document back into a domain
  `User` entity via a private `toEntity()` mapper — so nothing above this file ever
  sees a Mongoose document shape. The same pattern applies to
  `mongoAttemptRepository.js`, `mongoProgressRepository.js`, and
  `mongoOnboardingRepository.js`.
- **`infrastructure/security/`** — `bcryptPasswordHasher` (implements
  `PasswordHasher`), `stubTokenService` (implements `TokenService`).
- **`infrastructure/email/resendEmailSender.js`** — implements `EmailSender` using
  Resend.
- **`infrastructure/config/`**, **`infrastructure/logging/`** — environment
  loading, DB connection, logging.

### 4. `interfaces/http/` — Delivery mechanism

Depends on `application/`, adapts HTTP ↔ use cases.

- **`interfaces/http/controllers/`** — thin adapters.
  [`auth.controller.js`](../src/interfaces/http/controllers/auth.controller.js)
  takes already-built use-case functions as dependencies, pulls fields off
  `req.body`, calls the use case, and serializes the result with `res.json()`. It
  has zero business logic — if you deleted every `if` statement from a controller,
  nothing in the domain would break.
- **`interfaces/http/routes/`** — maps URLs/HTTP verbs to controller methods.
- **`interfaces/http/middleware/errorHandler.js`** — the single place that
  translates domain errors into HTTP status codes (`ValidationError` → 400,
  `UnauthorizedError` → 401, `NotFoundError` → 404, `ConflictError` → 409, anything
  else → 500 with the message hidden). This matters: the domain/application layers
  throw semantic errors; only this file at the edge knows what a status code is.
- **`interfaces/http/middleware/requireAuth.js`** — reads the bearer token, calls
  the injected `tokenService` / `userRepository` ports, attaches `req.user`.

### 5. `composition/container.js` — The composition root

This is the one file allowed to import from *both* `infrastructure/` and
`application/`/`interfaces/` in the same place — enforced by convention via the
header comment in the file itself. It:

1. Instantiates concrete infrastructure (`mongoUserRepository`,
   `bcryptPasswordHasher`, `stubTokenService`, `resendEmailSender`).
2. Injects them into use-case factories
   (`makeLogin({ userRepository, passwordHasher, tokenService })`).
3. Injects the resulting use cases into controller factories.
4. Returns a fully-wired Express router, which `app.js` mounts.

Everywhere else, dependencies flow in as arguments — nothing reaches out and
imports its own dependencies. This is manual dependency injection; no DI framework
is used at this scale.

## End-to-end trace: a login request

1. `POST /auth/login` hits `app.js` → the router returned by
   `container.buildRoutes()`.
2. `routes/auth.routes.js` maps it to `authController.login`.
3. `auth.controller.js` pulls `req.body.email` / `password`, calls the injected
   `login(email, password)` use case, wraps it in `asyncHandler` so rejections flow
   to Express's error middleware.
4. `login.js` validates the email via the domain value object, calls
   `userRepository.findByEmailWithPasswordHash` (a **port**, not Mongoose), calls
   `user.verifyPassword()` (a **domain entity** method), and on success builds a
   session via `issueSession`.
5. Under the hood, `userRepository` is actually `mongoUserRepository.js` — it runs
   the real Mongo query and hands back a `User` entity, never a raw document.
6. If anything fails (e.g. `UnauthorizedError`), it bubbles up untouched through
   the use case and controller (no `try/catch` needed anywhere — that's the point
   of a typed error hierarchy) until `errorHandler.js` turns it into a `401` JSON
   response.

## Why this pays off

- **Testability without infrastructure** — `backend/test/domain/` and
  `backend/test/application/` test business rules with plain Node's built-in
  `node:test` + fake repositories: no MongoDB, no HTTP server, no network. E.g.
  `test/domain/courseProgress.test.js` tests sorting/idempotency/validation purely
  in memory.
- **Replaceability** — swapping `stubTokenService` for real JWT, or Mongoose for
  another store, only touches `infrastructure/` + one line in `container.js`;
  `application/` and `domain/` are untouched.
- **A single seam for framework concerns** — HTTP status codes, request/response
  shapes, and Express-specific plumbing exist only in `interfaces/http/`. If the API
  ever needed a GraphQL or CLI front end alongside REST, the same use cases could
  be reused behind a different `interfaces/` adapter.
- **Enforced by convention, not tooling** — there's currently no
  dependency-cruiser/ESLint boundary rule checking these import rules
  automatically; it's upheld by the comments in `ports.js` and `container.js` and
  by discipline in code review. Worth flagging as a possible follow-up if stricter
  enforcement is wanted.
