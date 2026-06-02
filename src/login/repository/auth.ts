import "server-only"

import { gql } from "graphql-request"

export type AuthType = "PHONE" | "EMAIL"

export interface LoginInput {
  authType: AuthType
  phoneNumber?: string
  countryCode?: string
  email?: string
}

export interface LoginResponse {
  login: {
    verificationToken: string
    requiresVerification: boolean
    message: string
  }
}

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      verificationToken
      requiresVerification
      message
    }
  }
`

export interface VerifyOtpInput {
  verificationToken: string
  otp: string
}

export interface VerifyOtpResponse {
  verifyOtp: {
    accessToken: string
    refreshToken: string
  }
}

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      accessToken
      refreshToken
    }
  }
`
