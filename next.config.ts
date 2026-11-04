import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Browser menggunakan origin yang sama; Nginx menangani route ini di server.
    return ["api", "uploads"].map((prefix) => ({
      source: `/${prefix}/:path*`,
      destination: `http://127.0.0.1:5101/${prefix}/:path*`,
    }));
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
