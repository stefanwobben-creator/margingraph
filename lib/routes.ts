import { collections } from "@/lib/content/collections";

/**
 * Every internal link in the site chrome resolves through here.
 *
 * The collection paths are read from the registry rather than typed out a
 * second time, because they were typed out a second time once and drifted:
 * `guides` pointed at `/blog` long after a real `/guides` section existed, so
 * the header said one thing and did another. A label can be wrong. A path
 * should not be able to be.
 *
 * On-page anchors are root-absolute. A bare `#how-it-works` resolves against
 * whatever page you are on, which is silently correct on the homepage and
 * silently dead everywhere else.
 */
export const routes = {
  reports: collections.decisions.basePath,
  guides: collections.guides.basePath,
  blog: collections.blog.basePath,
  faq: collections.faq.basePath,
  exampleReport: "/#example-report",
  howItWorks: "/#how-it-works",
} as const;
