"use client"

import type { ReactNode } from "react"
import { ArrowLeft, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { brandInitial, brandName } from "@/src/onboarding/model/onboarding"

interface ProgressHeaderProps {
  stepNumber: number
  totalSteps: number
  progress: number
  canGoBack: boolean
  onBack: () => void
}

export function ProgressHeader({
  stepNumber,
  totalSteps,
  progress,
  canGoBack,
  onBack,
}: ProgressHeaderProps) {
  return (
    <header className="w-full">
      <div className="flex items-center justify-between px-6 py-4 sm:px-8">
        <div className="flex-1">
          {canGoBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 items-center justify-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-green-500 text-xs font-bold text-white">
            {brandInitial}
          </span>
          <span className="text-sm font-semibold tracking-tight">
            {brandName} onboarding
          </span>
        </div>

        <div className="flex-1 text-right text-sm text-muted-foreground">
          Step {stepNumber} of {totalSteps}
        </div>
      </div>

      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded-r-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  )
}

interface StepCardProps {
  title: string
  subtitle?: string
  children: ReactNode
}

/** The centered white card that holds a step's heading + content. */
export function StepCard({ title, subtitle, children }: StepCardProps) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm sm:p-10 dark:bg-neutral-900">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </div>
  )
}

interface RadioRowProps {
  title: string
  description?: string
  selected: boolean
  onSelect: () => void
}

/** Full-width selectable row with a leading radio dot (grade level, goal, etc.). */
export function RadioRow({ title, description, selected, onSelect }: RadioRowProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition",
        selected
          ? "border-green-500 bg-green-50 dark:bg-green-500/10"
          : "border-transparent bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition",
          selected ? "border-green-500" : "border-neutral-300 dark:border-neutral-600",
        )}
      >
        {selected ? <span className="size-2.5 rounded-full bg-green-500" /> : null}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold">{title}</span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </button>
  )
}

interface OptionCardProps {
  title: string
  subtitle?: string
  selected: boolean
  showCheck?: boolean
  onSelect: () => void
}

/** Compact selectable card for grids (exam quick options, minutes, subjects). */
export function OptionCard({
  title,
  subtitle,
  selected,
  showCheck,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "relative rounded-xl border-2 p-4 text-left transition",
        selected
          ? "border-green-500 bg-green-50 dark:bg-green-500/10"
          : "border-border bg-white hover:border-neutral-300 dark:bg-neutral-900 dark:hover:border-neutral-600",
      )}
    >
      {showCheck && selected ? (
        <span className="absolute right-3 top-3 flex size-4 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="size-3" />
        </span>
      ) : null}
      <div className="text-sm font-semibold">{title}</div>
      {subtitle ? (
        <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
      ) : null}
    </button>
  )
}

interface TextFieldProps {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (next: string) => void
  helper?: string
  autoComplete?: string
  autoFocus?: boolean
}

export function TextField({
  id,
  label,
  placeholder,
  value,
  onChange,
  helper,
  autoComplete,
  autoFocus,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block w-full rounded-full border-2 border-green-500 bg-white px-5 py-3 text-sm outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-green-200 dark:bg-neutral-900"
      />
      {helper ? (
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  )
}
