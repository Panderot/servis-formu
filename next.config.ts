import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // No landing page (task 73): the root address opens the sign-in page; a signed-in user is sent on to /app by the sign-in page.
  async redirects() {
    return [{ source: "/", destination: "/giris", permanent: false }];
  },
};

export default nextConfig;
