import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbopack: {
      fileSystemCacheForDev: true,
    },
  },
};

export default nextConfig;
