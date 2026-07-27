import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * /reports was published before decisions became the only commercial content
   * type. These are permanent: the URLs were live, and a 301 preserves whatever
   * link equity and bookmarks they picked up.
   */
  async redirects() {
    return [
      { source: "/reports", destination: "/decision", permanent: true },
      {
        source: "/reports/:slug",
        destination: "/decision/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
