"use client"

import { useCallback, useState } from "react"

import { brand, logIn, navLinks, signUp } from "@/src/landing-page/model/nav"

export function useNavbarViewModel() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => setIsMenuOpen((open) => !open), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  return {
    brand,
    navLinks,
    logIn,
    signUp,
    isMenuOpen,
    toggleMenu,
    closeMenu,
  }
}
