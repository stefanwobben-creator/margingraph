/**
 * The intake gate.
 *
 * Runs before the reasoning kernel and before payment. It knows arithmetic and
 * nothing else: no business, no money, no metric meanings. What rolls up into
 * what is supplied by the caller, because that mapping is a reading of a
 * document and readings belong where a human can correct them.
 *
 * Three outcomes, and the middle one is the product:
 *
 *   green   the reading reproduces the document's own totals. Proceed.
 *   amber   one figure does not follow from its parts. Name it and ask.
 *   red     nothing testable. Say so mechanically and charge nothing.
 *
 * Amber is not a failure state. It is usually the first finding, and often the
 * largest one, because a subtotal that does not reconcile is a number someone
 * has been steering by.
 */

export { reconcile } from "./reconcile";
export { disagreements } from "./compare";
export { toleranceFor, quantise } from "./tolerance";

export type {
  Cell,
  Disagreement,
  GateStatus,
  GateVerdict,
  Repair,
  Rollup,
  RollupCheck,
  RollupPart,
  RollupStatus,
  Statement,
} from "./types";
