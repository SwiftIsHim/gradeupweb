import {
  Landmark,
  Repeat2,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeatureIconKey } from "@/src/landing-page/model/features";
import { getFeaturesViewModel } from "@/src/landing-page/viewmodel/featuresViewModel";

const iconMap: Record<FeatureIconKey, { Icon: LucideIcon; className: string }> =
  {
    target: { Icon: Target, className: "bg-green-100 text-green-600" },
    cards: { Icon: Repeat2, className: "bg-purple-100 text-purple-600" },
    exam: { Icon: Landmark, className: "bg-amber-100 text-amber-600" },
    friends: { Icon: Users, className: "bg-sky-100 text-sky-600" },
  };

export function Features() {
  const vm = getFeaturesViewModel();

  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Badge>{vm.eyebrow}</Badge>
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {vm.title}
        </h2>
        <p className="max-w-2xl text-muted-foreground">{vm.subtitle}</p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {vm.items.map((feature) => {
          const { Icon, className } = iconMap[feature.iconKey];
          return (
            <article
              key={feature.id}
              className="rounded-2xl border border-border bg-white p-7 transition-shadow hover:shadow-md"
            >
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  className,
                )}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
