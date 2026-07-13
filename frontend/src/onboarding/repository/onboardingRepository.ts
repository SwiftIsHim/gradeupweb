import "server-only";

/**
 * Onboarding repository — the data layer for persisting onboarding answers.
 *
 * Talks to the Express + MongoDB backend with the session's access token
 * (`Bearer <accessToken>`) so route handlers never call the backend directly.
 */

import { BackendError } from "@/src/login/repository/accountRepository";

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export interface SaveOnboardingInput {
  firstName: string;
  lastName?: string;
  goal: string;
  gradeLevel: string;
  subjects: string[];
  examDateMode: string;
  examDate: string; // ISO 8601
  dailyMinutes: string;
  schedule: string;
  notifications: string;
}

export interface OnboardingProfile extends SaveOnboardingInput {
  completedAt: string;
}

/** Persist (upsert) the signed-in user's onboarding answers. */
export async function saveOnboarding(
  accessToken: string,
  input: SaveOnboardingInput,
): Promise<{ profile: OnboardingProfile }> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    throw new BackendError(
      "Could not reach the server. Please try again.",
      502,
    );
  }

  const data = (await res.json().catch(() => null)) as {
    profile?: OnboardingProfile;
    error?: { message?: string };
  } | null;

  if (!res.ok) {
    const message = data?.error?.message ?? "Request failed. Please try again.";
    throw new BackendError(message, res.status);
  }

  return data as { profile: OnboardingProfile };
}

/** Read the signed-in user's onboarding profile (null if not onboarded). */
export async function fetchOnboarding(
  accessToken: string,
): Promise<OnboardingProfile | null> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/onboarding`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    throw new BackendError(
      "Could not reach the server. Please try again.",
      502,
    );
  }

  const data = (await res.json().catch(() => null)) as {
    profile?: OnboardingProfile | null;
    error?: { message?: string };
  } | null;

  if (!res.ok) {
    const message = data?.error?.message ?? "Request failed. Please try again.";
    throw new BackendError(message, res.status);
  }

  return data?.profile ?? null;
}
