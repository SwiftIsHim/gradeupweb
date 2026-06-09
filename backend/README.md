# GradeUp Backend

Express API for authentication. OTP (phone) send/verify is intentionally **not**
implemented yet.

## Run

```bash
npm install
npm run dev      # node --watch src/index.js
```

Server: `http://localhost:4000`. Copy `.env.example` to `.env` and adjust.

## Structure

```
src/
├─ index.js            # entry — boots the HTTP server
├─ app.js              # express app: middleware + route mounting
├─ config/env.js       # env-driven config
├─ routes/
│  ├─ index.js         # mounts /health and /auth
│  └─ auth.routes.js   # auth endpoints
├─ controllers/
│  └─ auth.controller.js
├─ services/
│  └─ auth.service.js  # business logic (STUB — swap for Civilpromo GraphQL)
├─ validators/
│  └─ auth.validators.js
├─ middleware/
│  └─ errorHandler.js  # notFound + central error handler
└─ utils/
   ├─ ApiError.js
   ├─ asyncHandler.js
   └─ email.js
```

## Endpoints

| Method | Path                   | Body                          | Response                                                  |
| ------ | ---------------------- | ----------------------------- | -------------------------------------------------------- |
| GET    | `/health`              | —                             | `{ status, uptime }`                                     |
| POST   | `/auth/account-exists` | `{ email }`                   | `{ exists, login_hint }`                                 |
| POST   | `/auth/login`          | `{ email, password }`         | `{ access_token, refresh_token, expires_in, user }`      |
| POST   | `/auth/signup`         | `{ email, phone, name?, ... }`| `{ access_token, refresh_token, expires_in, user }` (201)|

### Flow

1. **Email screen** → `account-exists`. `exists: true` → password screen;
   `false` → signup (prefill email).
2. **Password screen** → `login`.
3. **Signup** → `signup` (creates account + auto-login). Phone OTP is omitted.

## Notes

- `services/auth.service.js` uses an **in-memory store** so the flow runs
  end-to-end. Replace each function with the real Civilpromo GraphQL call
  (`GRAPHQL_ENDPOINT`, `Bearer <accessToken>`).
- In development a demo account is seeded: `demo@civilpromo.com` /
  `password123`.
