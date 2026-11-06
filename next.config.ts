import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (smallest), WebP fallback for browsers without AVIF support
    formats: ["image/avif", "image/webp"],
    // Listing photos rarely change, so keep optimized copies for 31 days instead of 4 hours
    minimumCacheTTL: 2678400,
  },
  // The previous WordPress site's URLs, so existing links and search rankings carry over
  async redirects() {
    return [
      { source: "/new-homes", destination: "/homes", permanent: true },
      { source: "/project/:slug", destination: "/homes/:slug", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/were-hiring", destination: "/hiring", permanent: true },
      { source: "/phenomenal-five-survey", destination: "/homes", permanent: true },
      { source: "/upgrades", destination: "/quality-construction", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Browsers that have visited once always use HTTPS for the next two years
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
