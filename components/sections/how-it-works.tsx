import { Badge } from "@/components/ui/badge"
import { getHowItWorksViewModel } from "@/lib/viewmodels/howItWorksViewModel"

export function HowItWorks() {
  const vm = getHowItWorksViewModel()

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Badge>{vm.eyebrow}</Badge>
        <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {vm.title}
        </h2>
      </div>

      <ol className="mt-12 grid gap-5 sm:grid-cols-3">
        {vm.steps.map((step) => (
          <li
            key={step.id}
            className="rounded-2xl border border-border bg-white p-7"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-green-500 text-base font-bold text-white">
              {step.number}
            </div>
            <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
