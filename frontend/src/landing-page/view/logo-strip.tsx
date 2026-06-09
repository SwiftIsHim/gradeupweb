import { getOrganizationsViewModel } from "@/src/landing-page/viewmodel/organizationsViewModel"

export function LogoStrip() {
  const { caption, names } = getOrganizationsViewModel()

  return (
    <section className="border-y border-border/60 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {caption}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {names.map((name) => (
            <span key={name} className="text-sm font-semibold text-neutral-500">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
