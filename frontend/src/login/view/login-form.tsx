"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLoginFormViewModel } from "@/src/login/viewmodel/useLoginFormViewModel"

export function LoginForm() {
  const vm = useLoginFormViewModel()
  const onEmailStep = vm.step === "email"
  const onSignupStep = vm.step === "signup"

  return (
    <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-md">
        <h2 className="text-3xl font-bold tracking-tight">{vm.heading.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{vm.heading.subtitle}</p>

        <form onSubmit={vm.handleSubmit} className="mt-8 space-y-6">
          {/* Email — editable on step 1, locked (with a "change" link) afterwards. */}
          {onEmailStep ? (
            <TextField
              id="login-email"
              type="email"
              autoComplete="email"
              label={vm.email.label}
              placeholder={vm.email.placeholder}
              value={vm.emailValue}
              onChange={vm.setEmailValue}
              autoFocus
            />
          ) : (
            <div>
              <span className="block text-sm font-semibold">{vm.email.label}</span>
              <div className="mt-2 flex items-center justify-between rounded-full border border-border bg-neutral-50 px-5 py-3 dark:bg-neutral-800">
                <span className="text-sm text-foreground">{vm.emailValue}</span>
                <button
                  type="button"
                  onClick={vm.changeEmail}
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                >
                  {vm.changeEmailLabel}
                </button>
              </div>
            </div>
          )}

          {/* Signup-only fields for a brand-new account. */}
          {onSignupStep ? (
            <>
              <TextField
                id="signup-name"
                type="text"
                autoComplete="name"
                label={vm.name.label}
                placeholder={vm.name.placeholder}
                value={vm.nameValue}
                onChange={vm.setNameValue}
                autoFocus
              />
              <PhoneField
                label={vm.phone.label}
                flag={vm.phone.countryFlag}
                code={vm.phone.countryCode}
                placeholder={vm.phone.placeholder}
                value={vm.phoneValue}
                onChange={vm.setPhoneValue}
              />
            </>
          ) : null}

          {/* Password — shown on both the login and signup steps. */}
          {!onEmailStep ? (
            <div>
              <TextField
                id="login-password"
                type="password"
                autoComplete={onSignupStep ? "new-password" : "current-password"}
                label={vm.password.label}
                placeholder={vm.password.placeholder}
                value={vm.passwordValue}
                onChange={vm.setPasswordValue}
                autoFocus={!onSignupStep}
              />
              {!onSignupStep ? (
                <div className="mt-2 flex justify-end">
                  <Link
                    href={vm.forgotPasswordHref}
                    className="text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    {vm.forgotPasswordLabel}
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Confirm password — signup only. */}
          {onSignupStep ? (
            <TextField
              id="signup-confirm-password"
              type="password"
              autoComplete="new-password"
              label={vm.confirmPassword.label}
              placeholder={vm.confirmPassword.placeholder}
              value={vm.confirmPasswordValue}
              onChange={vm.setConfirmPasswordValue}
            />
          ) : null}

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
        </form>

        {!onEmailStep ? (
          <button
            type="button"
            onClick={vm.changeEmail}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {vm.changeEmailLabel}
          </button>
        ) : null}
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

interface PhoneFieldProps {
  label: string
  flag: string
  code: string
  placeholder: string
  value: string
  onChange: (next: string) => void
}

function PhoneField({
  label,
  flag,
  code,
  placeholder,
  value,
  onChange,
}: PhoneFieldProps) {
  return (
    <div>
      <label htmlFor="signup-phone" className="block text-sm font-semibold">
        {label}
      </label>
      <div className="mt-2 flex items-center rounded-full border-2 border-green-500 bg-white focus-within:ring-2 focus-within:ring-green-200 dark:bg-neutral-900">
        <div className="flex items-center gap-1.5 border-r border-border py-3 pl-5 pr-3">
          <span className="text-base leading-none" aria-hidden>
            {flag}
          </span>
          <span className="text-sm font-medium">{code}</span>
        </div>
        <input
          id="signup-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full flex-1 bg-transparent py-3 pl-3 pr-5 text-sm outline-none placeholder:text-neutral-500"
        />
      </div>
    </div>
  )
}
