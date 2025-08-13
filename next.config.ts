import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Production optimization settings
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: false,
  // Ensure proper output for Cloud Run
  output: 'standalone',
};

export default nextConfig;
