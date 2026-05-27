import Link from "next/link"

import { brand, navLinks } from "@/lib/models/nav"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-green-500 text-sm font-bold text-white">
            {brand.initial}
          </span>
          <span className="text-lg font-semibold tracking-tight">
            {brand.name}
          </span>
        </Link>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground">
          © {year} {brand.name}
        </p>
      </div>
    </footer>
  )
}
