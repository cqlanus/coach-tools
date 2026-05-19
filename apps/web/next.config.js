/** @type {import('next').NextConfig} */
const nextConfig = {
  // API requests to /api/* are proxied to FastAPI in development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://localhost:3011/:path*"
            : "http://localhost:3011/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
