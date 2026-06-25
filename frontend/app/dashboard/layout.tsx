import { MobileNav } from "@/src/dashboard/view/mobile-nav"

/**
 * Dashboard shell. The desktop sidebar is rendered per-page (it needs the
 * profile header + active item); on small screens that sidebar is hidden, so
 * this layout adds the bottom tab bar and reserves space for it.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="pb-20 lg:pb-0">
      {children}
      <MobileNav />
    </div>
  )
}
