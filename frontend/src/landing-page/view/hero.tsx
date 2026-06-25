import Link from "next/link"
import { Flame, Play, Star, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { HeroDashboard } from "@/src/landing-page/model/hero"
import { getHeroViewModel } from "@/src/landing-page/viewmodel/heroViewModel"

const avatarColors = [
  "bg-amber-200",
  "bg-purple-200",
  "bg-rose-200",
  "bg-sky-200",
  "bg-green-200",
]

export function Hero() {
  const vm = getHeroViewModel()

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <Badge>
            <span className="flex gap-0.5" aria-hidden>
              <span className="h-2.5 w-0.5 rounded-full bg-green-600" />
              <span className="h-2.5 w-0.5 rounded-full bg-green-600" />
            </span>
            {vm.eyebrow}
          </Badge>

          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {vm.headline}
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            {vm.subheadline}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            {vm.ctas.map((cta) => (
              <Button
                key={cta.href}
                asChild
                variant={cta.variant === "primary" ? "brand" : "outline"}
                className="h-12 rounded-full px-7 text-base"
              >
                <Link href={cta.href}>
                  {cta.icon === "play" && <Play className="fill-current" />}
                  {cta.label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {avatarColors.map((color, index) => (
                <span
                  key={index}
                  className={cn(
                    "size-7 rounded-full border-2 border-white",
                    color
                  )}
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {Array.from({ length: vm.ratingStars }).map((_, index) => (
                    <Star
                      key={index}
                      className="size-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">{vm.rating.score}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {vm.rating.caption}
              </p>
            </div>
          </div>
        </div>

        <DashboardPreview dashboard={vm.dashboard} />
      </div>
    </section>
  )
}

function DashboardPreview({ dashboard }: { dashboard: HeroDashboard }) {
  const { greeting, streakDays, stats, continueLesson, miniCards, toast } =
    dashboard

  return (
    <div className="relative">
      <div className="absolute -top-5 right-2 z-10 flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-lg sm:right-6 dark:bg-neutral-900">
        <span className="flex size-9 items-center justify-center rounded-full bg-amber-100">
          <Trophy className="size-4 text-amber-500" />
        </span>
        <div>
          <p className="text-sm font-semibold">
            {toast.name} {toast.detail}
          </p>
          <p className="text-xs text-muted-foreground">{toast.context}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-neutral-900 p-4 shadow-2xl sm:p-6">
        <div className="rounded-2xl bg-white p-5 dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">{greeting} 👋</p>
            <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
              <Flame className="size-3.5" />
              {streakDays}d
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xl font-bold",
                    stat.accent && "text-green-600"
                  )}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl bg-neutral-900 p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-green-400">
              Continue learning
            </p>
            <p className="mt-1 text-sm font-semibold">
              {continueLesson.subject} · Chapter {continueLesson.chapter} ·{" "}
              {continueLesson.progress}% complete
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-white/15">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${continueLesson.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            {miniCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-border p-3">
                <p className="text-xs font-semibold leading-tight">
                  {card.title}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {card.cardCount} cards · {card.minutes} min
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
