import type { NextConfig } from "next";

// Content Security Policy. Allows only self, Stripe, Supabase and the analytics
// endpoints. `unsafe-inline` on styles is required by Tailwind's injected styles;
// scripts are restricted to self + Stripe + the consent-gated analytics hosts.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://analytics.tiktok.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https: ${supabaseHost}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseHost} https://api.stripe.com https://www.google-analytics.com https://analytics.tiktok.com`,
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // 301 map for the URLs of the previous temporary setup. Extend as needed.
    return [
      { source: "/products", destination: "/shop", permanent: true },
      { source: "/store", destination: "/shop", permanent: true },
    ];
  },
};

export default nextConfig;
