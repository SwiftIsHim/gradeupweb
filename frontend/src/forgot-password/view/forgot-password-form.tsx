"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useForgotPasswordFormViewModel } from "@/src/forgot-password/viewmodel/useForgotPasswordFormViewModel"

export function ForgotPasswordForm() {
  const vm = useForgotPasswordFormViewModel()

  return (
    <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-md">
        <h2 className="text-3xl font-bold tracking-tight">{vm.heading.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{vm.heading.subtitle}</p>

        {vm.submitted ? (
          <div className="mt-8">
            <Link
              href={vm.backToLoginHref}
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              {vm.backToLoginLabel}
            </Link>
          </div>
        ) : (
          <form onSubmit={vm.handleSubmit} className="mt-8 space-y-6">
            <TextField
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              label={vm.email.label}
              placeholder={vm.email.placeholder}
              value={vm.emailValue}
              onChange={vm.setEmailValue}
              autoFocus
            />

            {vm.errorMessage ? (
              <p
                role="alert"
                className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700"
              >
                {vm.errorMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="brand"
              disabled={vm.isSubmitting}
              className="h-12 w-full rounded-full text-base disabled:opacity-60"
            >
              {vm.isSubmitting ? "Please wait…" : vm.submitLabel}
              {vm.isSubmitting ? null : <ArrowRight />}
            </Button>

            <div className="flex justify-center">
              <Link
                href={vm.backToLoginHref}
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                {vm.backToLoginLabel}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

interface TextFieldProps {
  id: string
  type: "text" | "email" | "password"
  autoComplete?: string
  label: string
  placeholder: string
  value: string
  onChange: (next: string) => void
  autoFocus?: boolean
}

function TextField({
  id,
  type,
  autoComplete,
  label,
  placeholder,
  value,
  onChange,
  autoFocus,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block w-full rounded-full border-2 border-green-500 bg-white px-5 py-3 text-sm outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-green-200 dark:bg-neutral-900"
      />
    </div>
  )
}
