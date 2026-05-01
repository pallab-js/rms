import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true, remotePatterns: [] },
};

export default nextConfig;
