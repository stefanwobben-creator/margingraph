/**
 * Every internal link in the app resolves through here.
 *
 * While the homepage is the only page that exists, navigation targets are
 * on-page anchors so nothing links to a 404. When the real routes are built,
 * change the value here and every link in the app follows.
 */
export const routes = {
  reports: "/decision",
  exampleReport: "#example-report",
  guides: "/blog",
  howItWorks: "#how-it-works",
  /** Per-report route. Only valid for reports with `hasPage: true`. */
  report: (slug: string) => `/decision/${slug}`,
  /** Per-article route. */
  guide: (slug: string) => `/blog/${slug}`,
} as const;
