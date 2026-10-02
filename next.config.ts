import type { NextConfig } from "next";

const phpApiUrl = (
  process.env.NEXT_PUBLIC_PHP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://cybersquare.com.ng/gelife/php-backend/api"
    : "http://localhost/gelife/php-backend/api")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${phpApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
