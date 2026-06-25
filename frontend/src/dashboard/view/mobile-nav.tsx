"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CircleUser, House, LayoutGrid, Target, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { navItems } from "@/src/dashboard/model/dashboard"

const NAV_ICONS = {
  home: House,
  courses: LayoutGrid,
  tests: Target,
  peers: Users,
  profile: CircleUser,
} as const

/**
 * Bottom tab bar shown on small screens, where the desktop sidebar is hidden.
 * Rendered once by the dashboard layout; active state is derived from the
 * current path.
 */
export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {navItems.map((item) => {
          const Icon = NAV_ICONS[item.icon]
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                  active ? "text-green-600" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
