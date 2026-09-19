import "server-only"

/**
 * Account-identity repository — the small `/users/me` slice of the backend
 * (distinct from `onboardingRepository`, which owns the study-profile
 * fields). Same bearer-token fetch shape as `courses/repository/coursesRepository.ts`.
 */

import { BackendError } from "@/src/login/repository/accountRepository"

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:4000"

export interface CurrentUser {
  id: string
  email: string
  phone: string
  name: string | null
  username: string
}

async function request<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
        ...init?.headers,
      },
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

export async function fetchCurrentUser(accessToken: string): Promise<CurrentUser> {
  const data = await request<{ user: CurrentUser }>(accessToken, `/users/me`)
  return data.user
}

export async function updateUsername(
  accessToken: string,
  username: string,
): Promise<CurrentUser> {
  const data = await request<{ user: CurrentUser }>(accessToken, `/users/me/username`, {
    method: "PATCH",
    body: JSON.stringify({ username }),
  })
  return data.user
}
