import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Portfolio assets live on the Sanity CDN; article covers on the Hashnode CDN.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
      { protocol: "https", hostname: "cdn.hashnode.com", pathname: "/res/**" },
    ],
  },
};

export default nextConfig;
