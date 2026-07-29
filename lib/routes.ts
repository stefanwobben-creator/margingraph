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
  reports: collections.reports.basePath,
  guides: collections.guides.basePath,
  faq: collections.faq.basePath,
  /** A real generated report, not a screenshot. */
  exampleReport: "/example-report",
  /**
   * Both halves of the flow used to be their own page. They are part of the
   * report now: a page that answers "what will you find in mine" belongs where
   * somebody is deciding, not one click away from it.
   */
  whatWeFind: "/reports/what-is-hiding-in-my-figures",
  /** Where every call to action ends. The only page that asks for anything. */
  send: "/send",
  /** A name and a face, because the site asks strangers for a balance sheet. */
  about: "/about",
  /**
   * One page for one kind of company, and where every advertisement lands.
   *
   * Sending paid traffic to a homepage written for anybody with figures is how
   * a budget is spent proving that "anybody" is not a person.
   */
  ecommerce: "/for/ecommerce",
  howItWorks: "/#how-it-works",
} as const;
