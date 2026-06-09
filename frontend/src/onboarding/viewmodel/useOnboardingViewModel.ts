"use client"

import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

import {
  STEP_ORDER,
  TOTAL_STEPS,
  initialData,
  gradeContent,
  dailyGoalContent,
  SCHEDULE_LABELS,
  MONTHS,
  type OnboardingData,
  type StepId,
} from "@/src/onboarding/model/onboarding"

// Where "Get started" sends the user after onboarding.
const FINISH_REDIRECT = "/"

const DAY_MS = 1000 * 60 * 60 * 24

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Resolve the chosen exam date to a concrete Date (or null if incomplete). */
function resolveExamDate(data: OnboardingData): Date | null {
  if (data.examDateMode === "4w") return new Date(startOfToday().getTime() + 28 * DAY_MS)
  if (data.examDateMode === "8w") return new Date(startOfToday().getTime() + 56 * DAY_MS)
  if (data.examDateMode === "custom") {
    if (!data.examDay || !data.examMonth || !data.examYear) return null
    const d = new Date(Number(data.examYear), Number(data.examMonth), Number(data.examDay))
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`
}

function daysFromToday(date: Date): number {
  return Math.round((date.getTime() - startOfToday().getTime()) / DAY_MS)
}

export function useOnboardingViewModel() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [done, setDone] = useState(false)

  const stepId: StepId = STEP_ORDER[stepIndex]

  const update = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleSubject = useCallback((value: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(value)
        ? prev.subjects.filter((s) => s !== value)
        : [...prev.subjects, value],
    }))
  }, [])

  // Derived exam-date info (used by the exam step preview + completion summary).
  const examDate = useMemo(() => resolveExamDate(data), [data])
  const daysToExam = examDate ? daysFromToday(examDate) : null

  // Per-step "can continue" gate.
  const canContinue = useMemo(() => {
    switch (stepId) {
      case "welcome":
        return true
      case "goal":
        return Boolean(data.goal)
      case "name":
        return data.firstName.trim().length > 0
      case "grade":
        return Boolean(data.gradeLevel)
      case "subjects":
        return data.subjects.length > 0
      case "examDate":
        return examDate !== null && daysToExam !== null && daysToExam > 0
      case "dailyGoal":
        return Boolean(data.dailyMinutes) && Boolean(data.schedule)
      case "notifications":
        return data.notifications !== ""
      default:
        return false
    }
  }, [stepId, data, examDate, daysToExam])

  const isLastStep = stepIndex === TOTAL_STEPS - 1

  const next = useCallback(() => {
    if (!canContinue) return
    if (isLastStep) {
      setDone(true)
      return
    }
    setStepIndex((i) => Math.min(i + 1, TOTAL_STEPS - 1))
  }, [canContinue, isLastStep])

  const back = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  const adjustSetup = useCallback(() => {
    setDone(false)
    setStepIndex(0)
  }, [])

  const getStarted = useCallback(() => {
    router.push(FINISH_REDIRECT)
    router.refresh()
  }, [router])

  // Completion summary (human-readable values).
  const summary = useMemo(() => {
    const gradeLabel =
      gradeContent.options.find((o) => o.value === data.gradeLevel)?.title ?? "—"
    const schedule = SCHEDULE_LABELS[data.schedule]
    const minutesLabel =
      dailyGoalContent.minutesOptions.find((o) => o.value === data.dailyMinutes)?.title ??
      `${data.dailyMinutes} min`

    return {
      name: `${data.firstName} ${data.lastName}`.trim() || data.firstName,
      grade: gradeLabel,
      examDate:
        examDate && daysToExam !== null
          ? `${formatDate(examDate)} · in ${daysToExam} days`
          : "—",
      dailyGoal: schedule ? `${minutesLabel} · ${schedule.label}` : minutesLabel,
      notifications: data.notifications === "on" ? "Enabled" : "Disabled",
    }
  }, [data, examDate, daysToExam])

  const startTime = SCHEDULE_LABELS[data.schedule]?.time ?? "your study time"
  const firstSubjectTitle = useMemo(() => {
    return (
      [
        "constitution",
        "public-service-rules",
        "financial-regs",
        "public-admin",
        "current-affairs",
        "office-comms",
      ]
        .filter((v) => data.subjects.includes(v))
        .map(
          (v) =>
            ({
              constitution: "Constitution Basics",
              "public-service-rules": "Public Service Rules",
              "financial-regs": "Financial Regulations",
              "public-admin": "Public Administration",
              "current-affairs": "Current Affairs",
              "office-comms": "Office Communication",
            })[v],
        )[0] ?? "your first topic"
    )
  }, [data.subjects])

  return {
    // navigation
    stepId,
    stepNumber: stepIndex + 1,
    totalSteps: TOTAL_STEPS,
    progress: Math.round(((stepIndex + (done ? 1 : 0)) / TOTAL_STEPS) * 100),
    canGoBack: stepIndex > 0 && !done,
    canContinue,
    isLastStep,
    done,
    next,
    back,
    adjustSetup,
    getStarted,
    // data + setters
    data,
    update,
    toggleSubject,
    // derived
    examDate,
    daysToExam,
    summary,
    startTime,
    firstSubjectTitle,
  }
}
