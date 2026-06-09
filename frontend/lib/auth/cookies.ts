import "server-only"

import { cookies } from "next/headers"

export const ACCESS_TOKEN_COOKIE = "auth_access"
export const REFRESH_TOKEN_COOKIE = "auth_refresh"
export const VERIFICATION_TOKEN_COOKIE = "login_vt"

const isProd = process.env.NODE_ENV === "production"

const baseCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
}

export async function setVerificationCookie(verificationToken: string) {
  const jar = await cookies()
  jar.set(VERIFICATION_TOKEN_COOKIE, verificationToken, {
    ...baseCookie,
    maxAge: 60 * 10, // OTP expires in 10 minutes per API docs
  })
}

export async function readVerificationCookie(): Promise<string | undefined> {
  const jar = await cookies()
  return jar.get(VERIFICATION_TOKEN_COOKIE)?.value
}

export async function clearVerificationCookie() {
  const jar = await cookies()
  jar.delete(VERIFICATION_TOKEN_COOKIE)
}

export async function setSessionCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies()
  jar.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookie,
    maxAge: 60 * 60 * 24, // 24h — refresh handler renews when expired
  })
  jar.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookie,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearSessionCookies() {
  const jar = await cookies()
  jar.delete(ACCESS_TOKEN_COOKIE)
  jar.delete(REFRESH_TOKEN_COOKIE)
}
