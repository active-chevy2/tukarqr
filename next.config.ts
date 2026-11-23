import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@tukarqr/qr-core"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
