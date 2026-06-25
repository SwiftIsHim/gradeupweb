import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WatermelonDB ships partly-untranspiled modern JS; let Next compile it so
  // it bundles cleanly under Turbopack.
  transpilePackages: ["@nozbe/watermelondb"],
};

export default nextConfig;
