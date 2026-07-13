"use client"

import * as Sentry from "@sentry/nextjs"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState, type FormEvent } from "react"

import { loginContent } from "@/src/login/model/login"

export type LoginStep = "email" | "password" | "signup"

interface ApiResponse {
  exists?: boolean
  ok?: boolean
  error?: string
  user?: { id: string; email: string }
}

// Where to send the user once they're authenticated. Returning users go
// straight to their dashboard; brand-new accounts run onboarding first.
const LOGIN_REDIRECT = "/dashboard"
const SIGNUP_REDIRECT = "/onboarding"

function toE164(national: string): string {
  const digits = national.replace(/\D/g, "").replace(/^0+/, "")
  return `${loginContent.form.phone.countryCode}${digits}`
}

export function useLoginFormViewModel() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>("email")
  const [emailValue, setEmailValue] = useState("")
  const [passwordValue, setPasswordValue] = useState("")
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("")
  const [nameValue, setNameValue] = useState("")
  const [phoneValue, setPhoneValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Go back to the email step to enter a different address.
  const changeEmail = useCallback(() => {
    setStep("email")
    setPasswordValue("")
    setConfirmPasswordValue("")
    setNameValue("")
    setPhoneValue("")
    setErrorMessage(null)
  }, [])

  async function postJson(url: string, payload: unknown): Promise<ApiResponse> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data: ApiResponse = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error ?? "Something went wrong. Try again.")
    }
    return data
  }

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) return
      setErrorMessage(null)
      setIsSubmitting(true)

      try {
        if (step === "email") {
          // Step 1 — branch on whether the account already exists.
          const data = await postJson("/api/auth/account-exists", {
            email: emailValue.trim(),
          })
          setStep(data.exists ? "password" : "signup")
          return
        }

        if (step === "password") {
          // Returning user — log in.
          const data = await postJson("/api/auth/login", {
            email: emailValue.trim(),
            password: passwordValue,
          })
          if (data.user) Sentry.setUser(data.user)
          router.push(LOGIN_REDIRECT)
        } else {
          // New user — passwords must match before we create the account.
          if (passwordValue !== confirmPasswordValue) {
            setErrorMessage("Passwords don't match. Please re-enter them.")
            return
          }
          const data = await postJson("/api/auth/signup", {
            email: emailValue.trim(),
            phone: toE164(phoneValue),
            name: nameValue.trim() || undefined,
            password: passwordValue,
          })
          if (data.user) Sentry.setUser(data.user)
          router.push(SIGNUP_REDIRECT)
        }

        router.refresh()
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Network error. Check your connection and try again.",
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      step,
      emailValue,
      passwordValue,
      confirmPasswordValue,
      nameValue,
      phoneValue,
      isSubmitting,
      router,
    ],
  )

  const heading = useMemo(() => {
    if (step === "password") return loginContent.form.passwordStep
    if (step === "signup") return loginContent.form.signupStep
    return loginContent.form.emailStep
  }, [step])

  const submitLabel = useMemo(() => {
    if (step === "password") return loginContent.form.loginLabel
    if (step === "signup") return loginContent.form.signupLabel
    return loginContent.form.continueLabel
  }, [step])

  return {
    ...loginContent.form,
    step,
    heading,
    submitLabel,
    emailValue,
    setEmailValue,
    passwordValue,
    setPasswordValue,
    confirmPasswordValue,
    setConfirmPasswordValue,
    nameValue,
    setNameValue,
    phoneValue,
    setPhoneValue,
    isSubmitting,
    errorMessage,
    handleSubmit,
    changeEmail,
  }
}
