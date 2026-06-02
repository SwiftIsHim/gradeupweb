"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useVerifyFormViewModel } from "@/src/login/viewmodel/useVerifyFormViewModel"

export function VerifyForm() {
  const vm = useVerifyFormViewModel()

  return (
    <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12">
      <div className="mx-auto w-full max-w-md">
        <h2 className="text-3xl font-bold tracking-tight">{vm.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{vm.subtitle}</p>

        <form onSubmit={vm.handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-semibold">
              {vm.otpLabel}
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={vm.otp}
              onChange={(e) => vm.setOtp(e.target.value)}
              className="mt-2 block w-full rounded-full border-2 border-green-500 bg-white px-5 py-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none placeholder:text-neutral-300 placeholder:tracking-[0.3em] focus:ring-2 focus:ring-green-200"
            />
          </div>

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
            disabled={vm.isSubmitting || vm.otp.length !== 6}
            className="h-12 w-full rounded-full text-base disabled:opacity-60"
          >
            {vm.isSubmitting ? "Verifying…" : vm.submitLabel}
            {vm.isSubmitting ? null : <ArrowRight />}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            href={vm.changeMethodHref}
            className="font-medium text-muted-foreground hover:text-foreground"
          >
            {vm.changeMethodLabel}
          </Link>
          <span className="text-muted-foreground">
            {vm.resendPrompt}{" "}
            <Link
              href={vm.changeMethodHref}
              className="font-medium text-green-600 hover:text-green-700"
            >
              {vm.resendLabel}
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
