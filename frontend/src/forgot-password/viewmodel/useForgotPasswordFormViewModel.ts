"use client"

import { useCallback, useState, type FormEvent } from "react"

import { forgotPasswordContent } from "@/src/forgot-password/model/forgot-password"

interface ApiResponse {
  ok?: boolean
  error?: string
}

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

export function useForgotPasswordFormViewModel() {
  const [emailValue, setEmailValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) return
      setErrorMessage(null)
      setIsSubmitting(true)

      try {
        await postJson("/api/auth/forgot-password", { email: emailValue.trim() })
        setSubmitted(true)
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
    [emailValue, isSubmitting],
  )

  const heading = submitted
    ? forgotPasswordContent.sentStep
    : forgotPasswordContent.requestStep

  return {
    ...forgotPasswordContent,
    heading,
    submitted,
    emailValue,
    setEmailValue,
    isSubmitting,
    errorMessage,
    handleSubmit,
  }
}
