"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState, type FormEvent } from "react"

import { loginContent, type LoginMethod } from "@/src/login/model/login"

interface LoginApiResponse {
  requiresVerification?: boolean
  message?: string
  error?: string
}

export function useLoginFormViewModel() {
  const router = useRouter()
  const [method, setMethod] = useState<LoginMethod>("phone")
  const [phoneValue, setPhoneValue] = useState("")
  const [emailValue, setEmailValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectMethod = useCallback((next: LoginMethod) => {
    setMethod(next)
    setErrorMessage(null)
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) return
      setErrorMessage(null)

      const payload =
        method === "phone"
          ? {
              method: "phone" as const,
              phoneNumber: phoneValue,
              countryCode: loginContent.form.phone.countryIso,
            }
          : { method: "email" as const, email: emailValue }

      setIsSubmitting(true)
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const data: LoginApiResponse = await res.json().catch(() => ({}))

        if (!res.ok) {
          setErrorMessage(data.error ?? "Something went wrong. Try again.")
          return
        }

        router.push("/login/verify")
      } catch {
        setErrorMessage("Network error. Check your connection and try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [emailValue, isSubmitting, method, phoneValue, router],
  )

  return {
    ...loginContent.form,
    method,
    selectMethod,
    phoneValue,
    setPhoneValue,
    emailValue,
    setEmailValue,
    isSubmitting,
    errorMessage,
    handleSubmit,
  }
}
