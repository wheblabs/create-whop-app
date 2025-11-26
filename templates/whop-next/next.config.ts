import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  
  // Disable client-side router cache to ensure fresh data after deployments
  // This fixes the "need incognito to see new deployment" issue
  experimental: {
    staleTimes: {
      dynamic: 0,  // Don't cache dynamic pages
      static: 30,  // Minimum allowed value (Next.js requires >= 30)
    },
  },

  // Set proper cache headers for all responses
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        // Allow caching for static assets (they have hashes in filenames)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
