import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/user/login", destination: "/login", permanent: false },
      { source: "/user/signup", destination: "/signup", permanent: false },
    ];
  },
};

export default nextConfig;
