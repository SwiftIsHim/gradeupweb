export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  id: string
  title: string
  links: FooterLink[]
}

export type FooterSocialKey = "x" | "linkedin" | "facebook" | "youtube"

export interface FooterSocial {
  key: FooterSocialKey
  href: string
  label: string
}

export interface FooterContent {
  tagline: string
  columns: FooterColumn[]
  socials: FooterSocial[]
  legalLine: string
}

export const footerContent: FooterContent = {
  tagline: "Built in Lagos for the Nigerian Civil Service.",
  columns: [
    {
      id: "product",
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Mock exams", href: "#mock-exams" },
        { label: "Flashcards", href: "#flashcards" },
        { label: "Study groups", href: "#study-groups" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      id: "company",
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      id: "resources",
      title: "Resources",
      links: [
        { label: "Help center", href: "/help" },
        { label: "Civil Service syllabus", href: "/syllabus" },
        { label: "Exam dates 2026", href: "/exam-dates" },
        { label: "Free guide (PDF)", href: "/guide" },
      ],
    },
    {
      id: "legal",
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Security", href: "/security" },
        { label: "Cookie policy", href: "/cookies" },
      ],
    },
  ],
  socials: [
    { key: "x", href: "https://x.com/gradeup", label: "Grade Up on X" },
    { key: "linkedin", href: "https://linkedin.com/company/gradeup", label: "Grade Up on LinkedIn" },
    { key: "facebook", href: "https://facebook.com/gradeup", label: "Grade Up on Facebook" },
    { key: "youtube", href: "https://youtube.com/@gradeup", label: "Grade Up on YouTube" },
  ],
  legalLine: "Grade Up Education Ltd. All rights reserved.",
}
