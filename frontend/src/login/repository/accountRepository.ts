import "server-only"

/**
 * Account repository — the data layer for the email-first auth flow.
 *
 * It owns all communication with the Express + MongoDB backend so route
 * handlers never call the backend directly. They call these functions and get
 * back plain domain data (or a BackendError they can translate to a response).
 */

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:4000"

export interface AccountUser {
  id: string
  email: string
  phone?: string
  name?: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  user: AccountUser
}

export interface AccountExistsResult {
  exists: boolean
  login_hint: string | null
}

export interface SignupInput {
  email: string
  phone: string
  name?: string
  organization?: string
  password: string
}

/** Error carrying the backend's message + an HTTP status to surface to the client. */
export class BackendError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "BackendError"
    this.status = status
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
  } catch {
    throw new BackendError("Could not reach the server. Please try again.", 502)
  }

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: { message?: string } })
    | null

  if (!res.ok) {
    const message = data?.error?.message ?? "Request failed. Please try again."
    throw new BackendError(message, res.status)
  }

  return data as T
}

/** Step 1 — does an account already exist for this email? */
export function requestAccountExists(email: string): Promise<AccountExistsResult> {
  return post<AccountExistsResult>("/auth/account-exists", { email })
}

/** Returning user — email + password login. */
export function requestPasswordLogin(
  email: string,
  password: string,
): Promise<Session> {
  return post<Session>("/auth/login", { email, password })
}

/** New user — create the account (no OTP) and return a session. */
export function requestSignup(input: SignupInput): Promise<Session> {
  return post<Session>("/auth/signup", input)
}

/** Request a password-reset email. Always resolves the same way, whether or not the account exists. */
export function requestPasswordResetEmail(email: string): Promise<{ ok: true }> {
  return post<{ ok: true }>("/auth/forgot-password", { email })
}

/** Complete a password reset with the token from the emailed link. */
export function requestPasswordReset(
  token: string,
  password: string,
): Promise<{ ok: true }> {
  return post<{ ok: true }>("/auth/reset-password", { token, password })
}
