"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { loadTestsHub, loadTestContent } from "@/src/tests/data/loadTests";
import type { TestsHubData } from "@/src/tests/data/loadTests";
import type { TestContent } from "@/src/tests/model/tests";

import { TestsHubView } from "./tests-hub";
import { TestRunner } from "./test-runner";

/**
 * Client loaders for the Tests section. They read test content from
 * WatermelonDB (seeded from the local JSON), fetch the user's attempts, merge,
 * and render the matching view. The pages stay server components for the
 * dashboard shell and hand the content area to these.
 */

type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "notFound" }
  | { status: "ready"; data: T };

function useStudyData<T>(
  load: () => Promise<T | null>,
  deps: unknown[],
): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (cancelled) return;
        setState(
          data === null ? { status: "notFound" } : { status: "ready", data },
        );
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
      {children}
    </div>
  );
}

function LoadingState() {
  return (
    <Centered>
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </span>
    </Centered>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Centered>
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        {message}
      </p>
    </Centered>
  );
}

function NotFoundState() {
  return (
    <Centered>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          We couldn’t find that test.
        </p>
        <Link
          href="/dashboard/tests"
          className="text-sm font-medium text-green-600 hover:text-green-700"
        >
          Back to tests
        </Link>
      </div>
    </Centered>
  );
}

export function TestsHubLoader() {
  const state = useStudyData<TestsHubData>(() => loadTestsHub(), []);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} />;
  if (state.status === "notFound") return <NotFoundState />;
  return <TestsHubView data={state.data} />;
}

export function TestRunnerLoader({ slug }: { slug: string }) {
  const state = useStudyData<TestContent>(() => loadTestContent(slug), [slug]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} />;
  if (state.status === "notFound") return <NotFoundState />;
  return <TestRunner test={state.data} />;
}
