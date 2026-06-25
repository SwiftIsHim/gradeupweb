"use client"

import type { ReactNode } from "react"
import { ArrowRight, Check, Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useOnboardingViewModel } from "@/src/onboarding/viewmodel/useOnboardingViewModel"
import {
  ProgressHeader,
  StepCard,
  RadioRow,
  OptionCard,
  TextField,
} from "@/src/onboarding/view/primitives"
import {
  welcomeContent,
  goalContent,
  nameContent,
  gradeContent,
  subjectsContent,
  examDateContent,
  dailyGoalContent,
  notificationsContent,
  completionContent,
  brandInitial,
  brandName,
  MONTHS,
} from "@/src/onboarding/model/onboarding"

type VM = ReturnType<typeof useOnboardingViewModel>

export function OnboardingFlow() {
  const vm = useOnboardingViewModel()

  if (vm.done) {
    return <Completion vm={vm} />
  }

  const step = renderStep(vm)

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <ProgressHeader
        stepNumber={vm.stepNumber}
        totalSteps={vm.totalSteps}
        progress={vm.progress}
        canGoBack={vm.canGoBack}
        onBack={vm.back}
      />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <StepCard title={step.title} subtitle={step.subtitle}>
          {step.content}

          <div className="mt-8">
            {vm.saveError ? (
              <p
                role="alert"
                className="mb-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700"
              >
                {vm.saveError}
              </p>
            ) : null}
            <Button
              type="button"
              variant="brand"
              onClick={vm.next}
              disabled={!vm.canContinue || vm.isSaving}
              className="h-12 w-full rounded-full text-base disabled:opacity-50"
            >
              {vm.isSaving ? (
                "Saving…"
              ) : (
                <>
                  {vm.isLastStep ? "Finish" : "Continue"}
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </StepCard>
      </main>
    </div>
  )
}

interface RenderedStep {
  title: string
  subtitle?: string
  content: ReactNode
}

function renderStep(vm: VM): RenderedStep {
  switch (vm.stepId) {
    case "welcome":
      return {
        title: welcomeContent.title,
        subtitle: welcomeContent.subtitle,
        content: (
          <ul className="space-y-3">
            {welcomeContent.highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        ),
      }

    case "goal":
      return {
        title: goalContent.title,
        subtitle: goalContent.subtitle,
        content: (
          <div className="space-y-3">
            {goalContent.options.map((opt) => (
              <RadioRow
                key={opt.value}
                title={opt.title}
                description={opt.description}
                selected={vm.data.goal === opt.value}
                onSelect={() => vm.update("goal", opt.value)}
              />
            ))}
          </div>
        ),
      }

    case "name":
      return {
        title: nameContent.title,
        subtitle: nameContent.subtitle,
        content: (
          <div className="space-y-5">
            <TextField
              id="onb-first-name"
              label={nameContent.firstNameLabel}
              placeholder={nameContent.firstNamePlaceholder}
              value={vm.data.firstName}
              onChange={(v) => vm.update("firstName", v)}
              autoComplete="given-name"
              autoFocus
            />
            <TextField
              id="onb-last-name"
              label={nameContent.lastNameLabel}
              placeholder={nameContent.lastNamePlaceholder}
              value={vm.data.lastName}
              onChange={(v) => vm.update("lastName", v)}
              autoComplete="family-name"
              helper={nameContent.helper}
            />
          </div>
        ),
      }

    case "grade":
      return {
        title: gradeContent.title,
        subtitle: gradeContent.subtitle,
        content: (
          <div className="space-y-3">
            {gradeContent.options.map((opt) => (
              <RadioRow
                key={opt.value}
                title={opt.title}
                description={opt.description}
                selected={vm.data.gradeLevel === opt.value}
                onSelect={() => vm.update("gradeLevel", opt.value)}
              />
            ))}
          </div>
        ),
      }

    case "subjects":
      return {
        title: subjectsContent.title,
        subtitle: subjectsContent.subtitle,
        content: (
          <div className="grid grid-cols-2 gap-3">
            {subjectsContent.options.map((opt) => (
              <OptionCard
                key={opt.value}
                title={opt.title}
                selected={vm.data.subjects.includes(opt.value)}
                showCheck
                onSelect={() => vm.toggleSubject(opt.value)}
              />
            ))}
          </div>
        ),
      }

    case "examDate":
      return {
        title: examDateContent.title,
        subtitle: examDateContent.subtitle,
        content: <ExamDateStep vm={vm} />,
      }

    case "dailyGoal":
      return {
        title: dailyGoalContent.title,
        subtitle: dailyGoalContent.subtitle,
        content: (
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold">
                {dailyGoalContent.minutesLabel}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {dailyGoalContent.minutesOptions.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    title={opt.title}
                    subtitle={opt.description}
                    selected={vm.data.dailyMinutes === opt.value}
                    onSelect={() => vm.update("dailyMinutes", opt.value)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">
                {dailyGoalContent.scheduleLabel}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {dailyGoalContent.scheduleOptions.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    title={opt.title}
                    selected={vm.data.schedule === opt.value}
                    onSelect={() => vm.update("schedule", opt.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        ),
      }

    case "notifications":
      return {
        title: notificationsContent.title,
        subtitle: notificationsContent.subtitle,
        content: (
          <div className="space-y-3">
            {notificationsContent.options.map((opt) => (
              <RadioRow
                key={opt.value}
                title={opt.title}
                description={opt.description}
                selected={vm.data.notifications === opt.value}
                onSelect={() =>
                  vm.update("notifications", opt.value as "on" | "off")
                }
              />
            ))}
          </div>
        ),
      }

    default:
      return { title: "", content: null }
  }
}

function ExamDateStep({ vm }: { vm: VM }) {
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 4 }, (_, i) => String(currentYear + i))

  const setCustomDate = (key: "examDay" | "examMonth" | "examYear", value: string) => {
    vm.update(key, value)
    vm.update("examDateMode", "custom")
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold">{examDateContent.quickLabel}</p>
        <div className="grid grid-cols-3 gap-3">
          {examDateContent.quickOptions.map((opt) => (
            <OptionCard
              key={opt.value}
              title={opt.title}
              subtitle={opt.subtitle ?? quickSubtitle(opt.value)}
              selected={vm.data.examDateMode === opt.value}
              onSelect={() => vm.update("examDateMode", opt.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">{examDateContent.pickLabel}</p>
        <div className="grid grid-cols-3 gap-3">
          <SelectBox
            label={examDateContent.dayLabel}
            value={vm.data.examDay}
            onChange={(v) => setCustomDate("examDay", v)}
            options={days}
          />
          <SelectBox
            label={examDateContent.monthLabel}
            value={vm.data.examMonth}
            onChange={(v) => setCustomDate("examMonth", v)}
            options={MONTHS.map((m, i) => ({ value: String(i), label: m }))}
          />
          <SelectBox
            label={examDateContent.yearLabel}
            value={vm.data.examYear}
            onChange={(v) => setCustomDate("examYear", v)}
            options={years}
          />
        </div>
      </div>

      {vm.daysToExam !== null && vm.daysToExam > 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-[#1c2620] px-4 py-4 text-white">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
            <Target className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              {vm.daysToExam} days to your exam
            </p>
            <p className="text-xs text-neutral-400">
              We'll suggest {vm.data.dailyMinutes || "30"} min/day across 12
              chapters to get you ready in time.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function quickSubtitle(mode: "4w" | "8w" | "custom"): string | undefined {
  if (mode === "custom") return undefined
  const days = mode === "4w" ? 28 : 56
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

interface SelectBoxProps {
  label: string
  value: string
  onChange: (next: string) => void
  options: Array<string | { value: string; label: string }>
}

function SelectBox({ label, value, onChange, options }: SelectBoxProps) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  )
  return (
    <label className="flex flex-col rounded-xl border-2 border-green-500 bg-white px-4 py-2.5 text-center dark:bg-neutral-900">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-center text-base font-medium outline-none"
      >
        <option value="" disabled>
          —
        </option>
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Completion({ vm }: { vm: VM }) {
  const labels = completionContent.summaryLabels
  const rows: Array<{ label: string; value: string }> = [
    { label: labels.name, value: vm.summary.name },
    { label: labels.grade, value: vm.summary.grade },
    { label: labels.examDate, value: vm.summary.examDate },
    { label: labels.dailyGoal, value: vm.summary.dailyGoal },
    { label: labels.notifications, value: vm.summary.notifications },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-foreground dark:bg-neutral-950">
      <div className="flex items-center gap-2 px-6 py-6 sm:px-10">
        <span className="flex size-8 items-center justify-center rounded-md bg-green-500 text-base font-bold text-white">
          {brandInitial}
        </span>
        <span className="text-lg font-semibold tracking-tight">{brandName}</span>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16 text-center">
        <div className="flex size-32 items-center justify-center rounded-full bg-green-500/20">
          <div className="flex size-24 items-center justify-center rounded-full bg-green-500">
            <Check className="size-12 text-[#10231a]" strokeWidth={3} />
          </div>
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">
          You're all set, {vm.data.firstName}!
        </h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          Your {vm.daysToExam ?? "personalized"}-day study plan is ready. We'll
          start with {vm.firstSubjectTitle} tomorrow at {vm.startTime}.
        </p>

        <div className="mt-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
          <div className="divide-y divide-border">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-6 py-4"
              >
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm font-semibold text-foreground">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={vm.adjustSetup}
            className={cn(
              "inline-flex h-12 items-center justify-center rounded-full border border-green-500 bg-transparent text-base font-medium text-green-600 transition hover:bg-green-50",
            )}
          >
            {completionContent.adjustLabel}
          </button>
          <Button
            type="button"
            variant="brand"
            onClick={vm.getStarted}
            className="h-12 w-full rounded-full text-base"
          >
            {completionContent.getStartedLabel}
            <ArrowRight />
          </Button>
        </div>
      </main>
    </div>
  )
}
