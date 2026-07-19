"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { resetPasswordContent as content } from "@/src/reset-password/model/reset-password"
import { useResetPasswordFormViewModel } from "@/src/reset-password/viewmodel/useResetPasswordFormViewModel"

interface ResetPasswordFormProps {
  token: string | undefined
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const vm = useResetPasswordFormViewModel(token)

  if (!token) {
    return (
      <Panel title={content.invalidLink.title} subtitle={content.invalidLink.message}>
        <div className="mt-8">
          <Link
            href={content.requestNewLinkHref}
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            {content.requestNewLinkLabel}
          </Link>
        </div>
      </Panel>
    )
  }

  if (vm.done) {
    return (
      <Panel title={content.doneStep.title} subtitle={content.doneStep.subtitle}>
        <div className="mt-8">
          <Link
            href={content.backToLoginHref}
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            {content.backToLoginLabel}
          </Link>
        </div>
      </Panel>
    )
  }

  return (
    <Panel title={content.heading.title} subtitle={content.heading.subtitle}>
      <form onSubmit={vm.handleSubmit} className="mt-8 space-y-6">
        <TextField
          id="reset-password-new"
          label={content.password.label}
          placeholder={content.password.placeholder}
          value={vm.passwordValue}
          onChange={vm.setPasswordValue}
          autoFocus
        />
        <TextField
          id="reset-password-confirm"
          label={content.confirmPassword.label}
          placeholder={content.confirmPassword.placeholder}
          value={vm.confirmPasswordValue}
          onChange={vm.setConfirmPasswordValue}
        />

        {vm.errorMessage ? (
          <p role="alert" className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
            {vm.errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="brand"
          disabled={vm.isSubmitting}
          className="h-12 w-full rounded-full text-base disabled:opacity-60"
        >
          {vm.isSubmitting ? "Please wait…" : content.submitLabel}
          {vm.isSubmitting ? null : <ArrowRight />}
        </Button>
      </form>
    </Panel>
  )
}

interface PanelProps {
  title: string
  subtitle: string
  children: ReactNode
}

function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-md">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </div>
  )
}

interface TextFieldProps {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (next: string) => void
  autoFocus?: boolean
}

function TextField({ id, label, placeholder, value, onChange, autoFocus }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="password"
        autoComplete="new-password"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block w-full rounded-full border-2 border-green-500 bg-white px-5 py-3 text-sm outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-green-200 dark:bg-neutral-900"
      />
    </div>
  )
}
