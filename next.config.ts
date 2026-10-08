import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    // Serve pre-optimized WebP assets directly as static files, bypassing on-demand
    // server-side CPU resizing bottlenecks that cause 6-8s delays on container hosts.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        // Cache all static images, videos, and fonts for 1 year (immutable) in browser & CDN cache
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|mp4|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
