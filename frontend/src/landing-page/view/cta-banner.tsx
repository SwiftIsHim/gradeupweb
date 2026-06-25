import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getCtaViewModel } from "@/src/landing-page/viewmodel/ctaViewModel"

export function CtaBanner() {
  const vm = getCtaViewModel()

  return (
    <section className="bg-white dark:bg-neutral-900">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {vm.title}
        </h2>
        <p className="text-muted-foreground">{vm.subtitle}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          {vm.buttons.map((btn) => (
            <Button
              key={btn.href}
              asChild
              variant={btn.variant === "primary" ? "brand" : "outline"}
              className="h-12 rounded-full px-7 text-base"
            >
              <Link href={btn.href}>{btn.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
