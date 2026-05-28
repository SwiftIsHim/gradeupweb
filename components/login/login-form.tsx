"use client"

import Link from "next/link"
import type { ComponentType, SVGProps } from "react"
import { ArrowRight, Mail, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LoginMethod, SocialProviderKey } from "@/lib/models/login"
import { useLoginFormViewModel } from "@/lib/viewmodels/useLoginFormViewModel"

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>

const methodIcons: Record<LoginMethod, ComponentType<{ className?: string }>> = {
  phone: Phone,
  email: Mail,
}

const GoogleIcon: SocialIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
    />
  </svg>
)

const AppleIcon: SocialIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M17.05 12.04c-.03-3.13 2.56-4.64 2.68-4.72-1.46-2.14-3.74-2.43-4.55-2.46-1.94-.2-3.79 1.14-4.77 1.14-1 0-2.52-1.11-4.14-1.08-2.13.03-4.1 1.24-5.19 3.14-2.22 3.85-.57 9.55 1.59 12.68 1.05 1.53 2.3 3.26 3.94 3.2 1.58-.06 2.18-1.02 4.09-1.02 1.9 0 2.44 1.02 4.11.99 1.7-.03 2.78-1.55 3.82-3.1 1.2-1.78 1.7-3.5 1.73-3.59-.04-.02-3.31-1.27-3.34-5.04zM13.96 2.92c.87-1.05 1.45-2.51 1.29-3.96-1.25.05-2.76.83-3.66 1.88-.8.93-1.5 2.41-1.31 3.84 1.39.11 2.81-.71 3.68-1.76z" />
  </svg>
)

const FacebookIcon: SocialIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="#1877F2" aria-hidden {...props}>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.53-4.68 1.31 0 2.69.23 2.69.23v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z" />
  </svg>
)

const socialIcons: Record<SocialProviderKey, SocialIcon> = {
  google: GoogleIcon,
  apple: AppleIcon,
  facebook: FacebookIcon,
}

export function LoginForm() {
  const vm = useLoginFormViewModel()

  return (
    <div className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12">
      <div className="mx-auto w-full max-w-md">
        <h2 className="text-3xl font-bold tracking-tight">{vm.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{vm.subtitle}</p>

        <form onSubmit={vm.handleSubmit} className="mt-8 space-y-6">
          <div
            role="tablist"
            aria-label="Login method"
            className="grid grid-cols-2 gap-1 rounded-full bg-neutral-100 p-1"
          >
            {vm.methodTabs.map((tab) => {
              const Icon = methodIcons[tab.method]
              const isActive = vm.method === tab.method
              return (
                <button
                  key={tab.method}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => vm.selectMethod(tab.method)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {vm.method === "phone" ? (
            <PhoneField
              label={vm.phone.label}
              flag={vm.phone.countryFlag}
              code={vm.phone.countryCode}
              placeholder={vm.phone.placeholder}
              value={vm.phoneValue}
              onChange={vm.setPhoneValue}
            />
          ) : (
            <EmailField
              label={vm.email.label}
              placeholder={vm.email.placeholder}
              value={vm.emailValue}
              onChange={vm.setEmailValue}
            />
          )}

          <div className="flex justify-end">
            <Link
              href={vm.forgotPasswordHref}
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              {vm.forgotPasswordLabel}
            </Link>
          </div>

          <Button
            type="submit"
            variant="brand"
            className="h-12 w-full rounded-full text-base"
          >
            {vm.submitLabel}
            <ArrowRight />
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center">
            <div className="h-px flex-1 bg-border" />
            <span className="px-3 text-xs text-muted-foreground">
              {vm.socialDivider}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {vm.socialProviders.map((provider) => {
              const Icon = socialIcons[provider.key]
              return (
                <Button
                  key={provider.key}
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full text-sm"
                  aria-label={`Continue with ${provider.label}`}
                >
                  <Icon className="size-4" />
                  {provider.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
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

function PhoneField({ label, flag, code, placeholder, value, onChange }: PhoneFieldProps) {
  return (
    <div>
      <label htmlFor="login-phone" className="block text-sm font-semibold">
        {label}
      </label>
      <div className="mt-2 flex items-center rounded-full border-2 border-green-500 bg-white focus-within:ring-2 focus-within:ring-green-200">
        <div className="flex items-center gap-1.5 border-r border-border py-3 pl-5 pr-3">
          <span className="text-base leading-none" aria-hidden>
            {flag}
          </span>
          <span className="text-sm font-medium">{code}</span>
        </div>
        <input
          id="login-phone"
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

interface EmailFieldProps {
  label: string
  placeholder: string
  value: string
  onChange: (next: string) => void
}

function EmailField({ label, placeholder, value, onChange }: EmailFieldProps) {
  return (
    <div>
      <label htmlFor="login-email" className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id="login-email"
        type="email"
        autoComplete="email"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block w-full rounded-full border-2 border-green-500 bg-white px-5 py-3 text-sm outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-green-200"
      />
    </div>
  )
}
