/**
 * Findings.
 *
 * The layer that was missing. The gate says whether the figures can be
 * trusted, the kernel reasons about claims, and neither of them ever produced
 * the thing an owner actually buys: a euro amount, attached to a line in their
 * own file, with the next move written out.
 *
 * Every rule here was first found by hand on a real set of figures, and none
 * of them were invented from a framework. That is the admission test for
 * adding another one.
 */

export { findAll, recoveryGap, ratioDrift, budgetOverrun } from "./rules";
export { reconciliationFindings, disagreementFindings } from "./from-gate";
export {
  render,
  teaser,
  REPORT_PRICE,
  BUNDLE_SIZE,
  BUNDLE_PRICE,
  MINIMUM_WORTH,
} from "./render";
export { portrait } from "./portrait";
export { cascade } from "./cascade";
export type { Cascade, CascadeStep } from "./cascade";
export type { Report, Teaser } from "./render";
export type { Portrait, PortraitLine } from "./portrait";
export type { Finding, FindingsInput, Period } from "./types";
