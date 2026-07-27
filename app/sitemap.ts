import type { MetadataRoute } from "next";

import { reports } from "@/lib/reports";
import { site } from "@/lib/site";

/**
 * Only pages that actually exist are listed. A sitemap that points at
 * unbuilt routes is worse than no sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const published = reports.filter((report) => report.hasPage);

  return [
    {
      url: site.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...published.map((report) => ({
      url: `${site.url}/reports/${report.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
