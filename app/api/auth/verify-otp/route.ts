import { ClientError } from "graphql-request"

import {
  clearVerificationCookie,
  readVerificationCookie,
  setSessionCookies,
} from "@/lib/auth/cookies"
import { anonClient } from "@/lib/graphql/client"
import {
  VERIFY_OTP_MUTATION,
  type VerifyOtpResponse,
} from "@/lib/graphql/auth"

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
    const data = await anonClient.request<VerifyOtpResponse>(
      VERIFY_OTP_MUTATION,
      { input: { verificationToken, otp } },
    )

    await setSessionCookies(
      data.verifyOtp.accessToken,
      data.verifyOtp.refreshToken,
    )
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
