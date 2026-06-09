import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import type { TestimonialAvatarColor } from "@/src/landing-page/model/testimonials"
import { getTestimonialsViewModel } from "@/src/landing-page/viewmodel/testimonialsViewModel"

const avatarStyles: Record<TestimonialAvatarColor, string> = {
  purple: "bg-purple-200 text-purple-700",
  sky: "bg-sky-200 text-sky-700",
  amber: "bg-amber-200 text-amber-700",
  rose: "bg-rose-200 text-rose-700",
  green: "bg-green-200 text-green-700",
}

export function Testimonials() {
  const vm = getTestimonialsViewModel()

  return (
    <section id="testimonials" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {vm.title}
          </h2>
          <p className="max-w-2xl text-muted-foreground">{vm.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {vm.items.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col justify-between gap-8 rounded-2xl border border-border bg-white p-7"
            >
              <div>
                <div className="flex gap-0.5" aria-label={`${item.stars} out of 5 stars`}>
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-neutral-700">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              <figcaption className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full text-xs font-bold",
                      avatarStyles[item.avatarColor],
                    )}
                  >
                    {item.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-green-700">
                  PASSED {item.passedScore}%
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
