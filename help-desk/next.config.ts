import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ["192.168.5.148"],
  images: {
    qualities: [60, 70, 75, 85],
    unoptimized: true,
  },
} satisfies Record<string, unknown>;

export default nextConfig as NextConfig;
