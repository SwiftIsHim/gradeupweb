"use client"

import { useCallback, useState, type FormEvent } from "react"

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

export function useResetPasswordFormViewModel(token: string | undefined) {
  const [passwordValue, setPasswordValue] = useState("")
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting || !token) return
      setErrorMessage(null)

      if (passwordValue !== confirmPasswordValue) {
        setErrorMessage("Passwords don't match. Please re-enter them.")
        return
      }

      setIsSubmitting(true)
      try {
        await postJson("/api/auth/reset-password", { token, password: passwordValue })
        setDone(true)
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
    [token, passwordValue, confirmPasswordValue, isSubmitting],
  )

  return {
    passwordValue,
    setPasswordValue,
    confirmPasswordValue,
    setConfirmPasswordValue,
    isSubmitting,
    errorMessage,
    done,
    handleSubmit,
  }
}
