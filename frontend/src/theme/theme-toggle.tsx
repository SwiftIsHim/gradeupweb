"use client"

import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "./theme-provider"

/**
 * Light/dark toggle button. Shows the icon of the mode you'd switch *to*.
 * Rendered in the dashboard sidebar (every page) and the home top bar.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
