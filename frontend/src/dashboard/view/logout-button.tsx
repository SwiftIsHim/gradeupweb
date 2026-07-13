"use client"

import * as Sentry from "@sentry/nextjs"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    if (isLoading) return
    setIsLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Even if the request fails, fall through to the login page.
    }
    Sentry.setUser(null)
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
    >
      <LogOut className="size-4" />
      {isLoading ? "Logging out…" : "Log Out"}
    </button>
  )
}
