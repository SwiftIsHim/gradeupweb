import { Star } from "lucide-react"

import { getStatsViewModel } from "@/src/landing-page/viewmodel/statsViewModel"

export function StatsStrip() {
  const vm = getStatsViewModel()

  return (
    <section className="bg-[#1c2620]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        {vm.items.map((stat) => (
          <div key={stat.id} className="text-center">
            <p className="flex items-center justify-center gap-2 text-3xl font-bold text-green-400 sm:text-4xl">
              {stat.value}
              {stat.showStar && (
                <Star className="size-6 fill-green-400 text-green-400" />
              )}
            </p>
            <p className="mt-1 text-xs text-neutral-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
