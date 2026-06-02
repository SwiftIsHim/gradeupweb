import "server-only"

import { getAnonClient } from "@/lib/graphql/client"
import {
  LOGIN_MUTATION,
  VERIFY_OTP_MUTATION,
  type LoginInput,
  type LoginResponse,
  type VerifyOtpInput,
  type VerifyOtpResponse,
} from "@/src/login/repository/auth"

/**
 * Login repository — the data layer for the login feature.
 *
 * It owns all communication with the GraphQL backend so the route handlers
 * (and any future server code) never talk to the client directly. They call
 * these functions and get back plain domain data.
 */

export async function requestLogin(input: LoginInput): Promise<LoginResponse["login"]> {
  const data = await getAnonClient().request<LoginResponse>(LOGIN_MUTATION, {
    input,
  })
  return data.login
}

export async function requestVerifyOtp(
  input: VerifyOtpInput,
): Promise<VerifyOtpResponse["verifyOtp"]> {
  const data = await getAnonClient().request<VerifyOtpResponse>(
    VERIFY_OTP_MUTATION,
    { input },
  )
  return data.verifyOtp
}
