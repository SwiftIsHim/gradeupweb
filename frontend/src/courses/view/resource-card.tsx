"use client";

import { ArrowRight, BookOpen, HelpCircle, LayoutGrid } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StudyResource } from "../model/courses";

interface ResourceCardProps {
  resource: StudyResource;
  active?: boolean;
  onClick?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  LayoutGrid,
  HelpCircle,
};

export function ResourceCard({ resource, active, onClick }: ResourceCardProps) {
  const Icon = iconMap[resource.icon] || BookOpen;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex flex-col rounded-lg border bg-card p-6 text-left transition-all hover:shadow-md",
        active
          ? "border-green-500 ring-1 ring-green-500"
          : "border-border hover:border-green-300",
      )}
    >
      <div className="mb-4 inline-flex w-fit rounded-lg bg-green-500/10 p-3">
        <Icon className="h-6 w-6 text-green-600" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {resource.name}
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">{resource.description}</p>

      <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-green-600">
        {active ? "Selected" : "Explore"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}
