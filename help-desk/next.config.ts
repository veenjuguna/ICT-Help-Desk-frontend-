import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    qualities: [70, 75, 85],
    unoptimized: true,
  },
};

export default nextConfig;