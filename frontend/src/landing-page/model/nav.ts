export interface NavLink {
  label: string
  href: string
}

export interface BrandInfo {
  name: string
  initial: string
}

export interface AuthAction {
  label: string
  href: string
}

export const brand: BrandInfo = {
  name: "Grade Up",
  initial: "G",
}

export const navLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
  { label: "Help", href: "#help" },
]

export const logIn: AuthAction = { label: "Log in", href: "/login" }
export const signUp: AuthAction = { label: "Sign up — free", href: "/signup" }
