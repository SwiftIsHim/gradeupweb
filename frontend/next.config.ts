import type { NextConfig } from "next";

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

export default nextConfig;
