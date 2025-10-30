/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ disable invalid experimental flag
  // experimental: { appDir: true }, // ❌ remove this

  // ✅ Optional environment passthrough
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // ✅ Avoid pre-render caching globally
  output: "standalone",
  trailingSlash: false,

  // ✅ Proxy backend API during dev
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*", // Proxy to backend
      },
    ];
  },
};

module.exports = nextConfig;
