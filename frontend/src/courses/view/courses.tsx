"use client";

import { useState } from "react";

import { ResourceCard } from "./resource-card";
import { CourseCard } from "./course-card";
import {
  STUDY_RESOURCES,
  resourceHref,
  type CourseSummary,
  type ResourceId,
  type StudyMode,
} from "../model/courses";

/**
 * The Study hub. Two tabs:
 *  - "study":   pick a course → its detail page.
 *  - "explore": pick a resource type (study guide / flashcards / quizzes),
 *               then pick a course to jump straight into that resource.
 * Courses are loaded on the client and passed in.
 */
export function CoursesView({ courses }: { courses: CourseSummary[] }) {
  const [mode, setMode] = useState<StudyMode>("study");
  const [resource, setResource] = useState<ResourceId | null>(null);

  const activeResource = STUDY_RESOURCES.find((r) => r.id === resource) ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Study</h1>

        <div className="flex gap-6 border-b border-border">
          {(["study", "explore"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`px-1 py-3 text-sm font-medium capitalize transition-colors ${
                mode === tab
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {mode === "explore" && (
        <div>
          <h2 className="mb-1 text-xl font-semibold text-foreground">Explore</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Choose how you want to study, then pick a course.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STUDY_RESOURCES.map((item) => (
              <ResourceCard
                key={item.id}
                resource={item}
                active={item.id === resource}
                onClick={() =>
                  setResource((current) =>
                    current === item.id ? null : item.id,
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {activeResource ? `${activeResource.name} · pick a course` : "Choose a topic"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeResource
                ? activeResource.description
                : "All materials organized by course"}
            </p>
          </div>
          {activeResource && (
            <button
              onClick={() => setResource(null)}
              className="shrink-0 text-sm font-medium text-green-600 hover:text-green-700"
            >
              Clear
            </button>
          )}
        </div>

        {courses.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No courses are available yet. Check back soon.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard
                key={course.slug}
                course={course}
                href={
                  activeResource
                    ? resourceHref(course.slug, activeResource.id)
                    : undefined
                }
                cta={activeResource?.cta}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
