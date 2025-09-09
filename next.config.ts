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
  poweredByHeader: false,
  generateEtags: false,
  // Ensure proper output for Cloud Run
  output: 'standalone',
  
  // WebAssembly configuration for @react-pdf/renderer
  webpack: (config, { isServer }) => {
    // Handle WebAssembly files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // Add WASM file handling
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
    
    // Ensure proper WASM loading in the browser
    if (!isServer) {
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
    }
    
    return config;
  },
  
  // Headers for WASM files
  async headers() {
    return [
      {
        source: '/static/wasm/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
