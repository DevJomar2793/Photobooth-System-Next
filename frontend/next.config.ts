import type { NextConfig } from "next";

const productionBackendUrl = (
  process.env.BACKEND_URL ??
  "https://atbackend-photobooth-system-next.onrender.com"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async redirects() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${productionBackendUrl}/api/:path*`,
        permanent: false,
      },
      {
        source: "/uploads/:path*",
        destination: `${productionBackendUrl}/uploads/:path*`,
        permanent: false,
      },
    ];
  },
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
