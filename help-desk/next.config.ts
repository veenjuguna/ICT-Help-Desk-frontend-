import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ["192.168.5.148"],
  images: {
    qualities: [60, 70, 75, 85],
    unoptimized: true,
  },
};

export default nextConfig;