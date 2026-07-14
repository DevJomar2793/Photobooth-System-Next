import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Production calls Render directly because Vercel rejects the Render
    // hostname as an external rewrite target. Keep the proxy for local dev.
    if (process.env.NODE_ENV === "production") {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:8000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
