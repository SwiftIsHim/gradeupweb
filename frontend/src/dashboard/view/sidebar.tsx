import Link from "next/link"
import {
  CircleUser,
  House,
  LayoutGrid,
  Target,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/src/theme/theme-toggle"
import {
  brandInitial,
  brandName,
  navItems,
  type DashboardHeader,
  type NavItem,
} from "@/src/dashboard/model/dashboard"

const NAV_ICONS = {
  home: House,
  courses: LayoutGrid,
  tests: Target,
  peers: Users,
  profile: CircleUser,
} as const

export function Sidebar({
  header,
  active,
}: {
  header: DashboardHeader
  active: NavItem["icon"]
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex size-8 items-center justify-center rounded-md bg-green-500 text-base font-bold text-white">
          {brandInitial}
        </span>
        <span className="text-lg font-semibold tracking-tight">{brandName}</span>
      </div>

      <nav className="flex-1 px-4 py-2">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <NavRow key={item.label} item={item} active={item.icon === active} />
          ))}
        </ul>
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-green-500 text-sm font-semibold text-white">
            {header.avatarInitial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{header.shortName}</p>
            <p className="text-xs text-muted-foreground">Free plan</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = NAV_ICONS[item.icon]
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
          active
            ? "bg-[#1c2620] text-white"
            : "text-foreground hover:bg-muted",
        )}
      >
        <Icon className="size-4.5" />
        {item.label}
      </Link>
    </li>
  )
}
