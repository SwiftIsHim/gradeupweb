import { ClientError } from "graphql-request"

import {
  clearVerificationCookie,
  readVerificationCookie,
  setSessionCookies,
} from "@/lib/auth/cookies"
import { requestVerifyOtp } from "@/src/login/repository/authRepository"

interface VerifyOtpBody {
  otp: string
}

export async function POST(request: Request) {
  let body: VerifyOtpBody
  try {
    body = (await request.json()) as VerifyOtpBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const otp = body.otp?.trim()
  if (!otp || !/^\d{6}$/.test(otp)) {
    return Response.json(
      { error: "Enter the 6-digit code." },
      { status: 400 },
    )
  }

  const verificationToken = await readVerificationCookie()
  if (!verificationToken) {
    return Response.json(
      { error: "Your login session expired. Start over." },
      { status: 401 },
    )
  }

  try {
    const session = await requestVerifyOtp({ verificationToken, otp })

    await setSessionCookies(session.accessToken, session.refreshToken)
    await clearVerificationCookie()

    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof ClientError) {
      const message =
        error.response.errors?.[0]?.message ?? "Verification failed."
      return Response.json({ error: message }, { status: 400 })
    }
    return Response.json(
      { error: "Could not reach the server. Please try again." },
      { status: 502 },
    )
  }
}
