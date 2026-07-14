import type { NextConfig } from "next";

const backendUrl = (
  process.env.BACKEND_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://atbackend-photobooth-system-next.onrender.com"
    : "http://127.0.0.1:8000")
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
