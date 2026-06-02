import Link from "next/link"
import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { getLoginPanelViewModel } from "@/src/login/viewmodel/loginPanelViewModel"

export function LoginPanel() {
  const vm = getLoginPanelViewModel()

  return (
    <aside className="relative hidden flex-col justify-between bg-[#1c2620] p-10 text-white lg:flex">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-green-500 text-base font-bold text-white">
          {vm.brand.initial}
        </span>
        <span className="text-lg font-semibold tracking-tight">
          {vm.brand.name}
        </span>
      </Link>

      <div className="flex max-w-md flex-col gap-5">
        <Badge className="self-start uppercase">{vm.eyebrow}</Badge>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
          {vm.headline}
        </h1>
        <p className="text-sm leading-relaxed text-neutral-400">{vm.subhead}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-neutral-400">{vm.trustedCaption}</p>
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: vm.ratingStars }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs text-neutral-400">
            <span className="font-semibold text-white">{vm.ratingScore}</span>{" "}
            {vm.ratingCaption}
          </span>
        </div>
      </div>
    </aside>
  )
}
