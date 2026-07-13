import "server-only"

import * as Sentry from "@sentry/nextjs"

/**
 * Reports a truly unexpected route-handler failure to Sentry. Route handlers
 * across this app catch BackendError (expected — bad password, validation,
 * etc.) separately and translate it to a client-facing status; anything else
 * falls through to a generic 500 and, without this, vanished silently since
 * the handler never rethrows for Next.js's automatic instrumentation to see.
 */
export function reportUnexpectedError(
  error: unknown,
  context: { route: string; [key: string]: unknown },
) {
  const { route, ...extra } = context
  Sentry.captureException(error, { tags: { route }, extra })
}
