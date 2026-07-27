/**
 * Every internal link in the app resolves through here.
 *
 * While the homepage is the only page that exists, navigation targets are
 * on-page anchors so nothing links to a 404. When the real routes are built,
 * change the value here and every link in the app follows.
 */
export const routes = {
  reports: "#reports",
  exampleReport: "#example-report",
  guides: "#guides",
  howItWorks: "#how-it-works",
  /** Per-report route. Only valid for reports with `hasPage: true`. */
  report: (slug: string) => `/reports/${slug}`,
  /** Per-guide route. Becomes `/guides/${slug}`. */
  guide: (slug: string) => `#guides-${slug}`,
} as const;
