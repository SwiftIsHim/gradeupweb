import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isCI = process.env.CI === "true";

const nextConfig: NextConfig = {
  // WatermelonDB ships partly-untranspiled modern JS; let Next compile it so
  // it bundles cleanly under Turbopack.
  transpilePackages: ["@nozbe/watermelondb"],

  // The course/test content APIs read these JSON folders from disk at runtime
  // (readdir + readFile). That access is dynamic, so Vercel's output file
  // tracing can't detect it — without this, the folders aren't bundled into the
  // serverless functions and content comes up empty in production. Force them in.
  outputFileTracingIncludes: {
    "/api/courses/content": ["./courses/**/*.json"],
    "/api/tests/content": ["./Tests/**/*.json"],
  },
};

const config = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "swift-4k",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: isCI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});

export default isCI ? nextConfig : config;
