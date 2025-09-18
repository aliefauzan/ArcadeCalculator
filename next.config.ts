import type { NextConfig } from "next";
import packageJson from './package.json';

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
  
  // Environment variables for build info
  env: {
    BUILD_DATE: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    BUILD_VERSION: packageJson.version,
    BUILD_TIME: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
  },
  
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
