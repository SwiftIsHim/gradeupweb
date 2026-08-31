"use client"

import { useState } from "react"
import { Check, Pencil, X } from "lucide-react"

export function UsernameEditor({ username }: { username: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(username)
  const [current, setCurrent] = useState(username)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    const trimmed = value.trim().toLowerCase()
    if (trimmed === current) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/users/me/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      })
      const data = (await res.json().catch(() => null)) as
        | { user?: { username: string }; error?: string }
        | null
      if (!res.ok) {
        setError(data?.error ?? "Could not update username.")
        return
      }
      setCurrent(data?.user?.username ?? trimmed)
      setValue(data?.user?.username ?? trimmed)
      setEditing(false)
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setValue(current)
          setError(null)
          setEditing(true)
        }}
        className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
      >
        @{current}
        <Pencil className="size-3" />
      </button>
    )
  }

  return (
    <div className="mt-1 flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">@</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={saving}
          autoFocus
          className="w-32 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground outline-none focus:border-green-500"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          aria-label="Save"
          className="rounded-full bg-green-600 p-1 text-white transition hover:bg-green-700 disabled:opacity-60"
        >
          <Check className="size-3" />
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false)
            setError(null)
          }}
          disabled={saving}
          aria-label="Cancel"
          className="rounded-full border border-border p-1 text-muted-foreground transition hover:bg-muted"
        >
          <X className="size-3" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
