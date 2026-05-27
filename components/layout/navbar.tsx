"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useNavbarViewModel } from "@/lib/viewmodels/useNavbarViewModel"

export function Navbar() {
  const { brand, navLinks, logIn, signUp, isMenuOpen, toggleMenu, closeMenu } =
    useNavbarViewModel()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-green-500 text-sm font-bold text-white">
            {brand.initial}
          </span>
          <span className="text-lg font-semibold tracking-tight">
            {brand.name}
          </span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
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

        <div className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" className="h-10 px-4">
            <Link href={logIn.href}>{logIn.label}</Link>
          </Button>
          <Button asChild variant="brand" className="h-10 rounded-full px-5">
            <Link href={signUp.href}>{signUp.label}</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-border/60 bg-white md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 border-t border-border/60 px-4 py-3">
            <Button asChild variant="outline" className="h-10">
              <Link href={logIn.href} onClick={closeMenu}>
                {logIn.label}
              </Link>
            </Button>
            <Button asChild variant="brand" className="h-10 rounded-full">
              <Link href={signUp.href} onClick={closeMenu}>
                {signUp.label}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
