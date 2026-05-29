import { ClientError } from "graphql-request"

import { setVerificationCookie } from "@/lib/auth/cookies"
import { anonClient } from "@/lib/graphql/client"
import {
  LOGIN_MUTATION,
  type AuthType,
  type LoginInput,
  type LoginResponse,
} from "@/lib/graphql/auth"

interface LoginBody {
  method: "phone" | "email"
  phoneNumber?: string
  countryCode?: string
  email?: string
}

function buildInput(body: LoginBody): LoginInput | { error: string } {
  if (body.method === "phone") {
    const phone = body.phoneNumber?.replace(/\s+/g, "")
    if (!phone) return { error: "Phone number is required." }
    if (!body.countryCode) return { error: "Country code is required." }
    return {
      authType: "PHONE" satisfies AuthType,
      phoneNumber: phone,
      countryCode: body.countryCode,
    }
  }

  const email = body.email?.trim()
  if (!email) return { error: "Email is required." }
  return { authType: "EMAIL" satisfies AuthType, email }
}

export async function POST(request: Request) {
  let body: LoginBody
  try {
    body = (await request.json()) as LoginBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const input = buildInput(body)
  if ("error" in input) {
    return Response.json({ error: input.error }, { status: 400 })
  }

  try {
    const data = await anonClient.request<LoginResponse>(LOGIN_MUTATION, {
      input,
    })

    await setVerificationCookie(data.login.verificationToken)

    return Response.json({
      requiresVerification: data.login.requiresVerification,
      message: data.login.message,
    })
  } catch (error) {
    if (error instanceof ClientError) {
      const message =
        error.response.errors?.[0]?.message ?? "Login request failed."
      return Response.json({ error: message }, { status: 400 })
    }
    return Response.json(
      { error: "Could not reach the server. Please try again." },
      { status: 502 },
    )
  }
}
