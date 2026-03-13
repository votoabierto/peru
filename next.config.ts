import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'votoinformadoia.jne.gob.pe',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rxxoaqubaouyumxuprode.supabase.co',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 86400,
    deviceSizes: [390, 768, 1024, 1280],
    imageSizes: [48, 96, 128, 256],
  },

  compress: true,

  async headers() {
    return [
      {
        source: '/api/v1/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ]
  },

  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
