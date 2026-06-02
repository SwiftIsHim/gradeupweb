"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState, type FormEvent } from "react"

import { verifyContent } from "@/src/login/model/verify"

interface VerifyApiResponse {
  ok?: boolean
  error?: string
}

export function useVerifyFormViewModel() {
  const router = useRouter()
  const [otp, setOtpRaw] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const setOtp = useCallback((next: string) => {
    setOtpRaw(next.replace(/\D/g, "").slice(0, 6))
    setErrorMessage(null)
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) return
      if (otp.length !== 6) {
        setErrorMessage("Enter all 6 digits.")
        return
      }

      setIsSubmitting(true)
      setErrorMessage(null)
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp }),
        })
        const data: VerifyApiResponse = await res.json().catch(() => ({}))

        if (!res.ok) {
          setErrorMessage(data.error ?? "Verification failed.")
          if (res.status === 401) {
            // verification token expired or missing — send them back to start
            router.push("/login")
          }
          return
        }

        router.push("/")
      } catch {
        setErrorMessage("Network error. Try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, otp, router],
  )

  return {
    ...verifyContent,
    otp,
    setOtp,
    isSubmitting,
    errorMessage,
    handleSubmit,
  }
}
