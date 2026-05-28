"use client"

import { useCallback, useState, type FormEvent } from "react"

import { loginContent, type LoginMethod } from "@/lib/models/login"

export function useLoginFormViewModel() {
  const [method, setMethod] = useState<LoginMethod>("phone")
  const [phoneValue, setPhoneValue] = useState("")
  const [emailValue, setEmailValue] = useState("")

  const selectMethod = useCallback((next: LoginMethod) => setMethod(next), [])

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      // submission wiring lives outside the viewmodel; this hook only owns local form state
    },
    [],
  )

  return {
    ...loginContent.form,
    method,
    selectMethod,
    phoneValue,
    setPhoneValue,
    emailValue,
    setEmailValue,
    handleSubmit,
  }
}
