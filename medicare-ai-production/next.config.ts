import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/dashboard/chatbot",
        destination: "/dashboard/chat",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
