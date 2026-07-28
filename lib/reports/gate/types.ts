/**
 * The intake gate.
 *
 * Everything in this module is deterministic. Same input, same verdict, every
 * time, with no model in the path. That is the whole point: the gate is what
 * the rest of the product rests on, so it cannot itself be a judgement call.
 *
 * The gate answers one question. Not "is this document correct", which nobody
 * can answer, but "does my reading of it reproduce its own totals". If the
 * arithmetic closes, the reading is right. If it does not, either the reading
 * is wrong or the document is, and in both cases nothing downstream may run.
 */

/** A single reported figure. `null` means the cell was blank, not zero. */
export type Cell = {
  id: string;
  label: string;
  value: number | null;
};

/** A signed reference from a subtotal to one of the figures beneath it. */
export type RollupPart = {
  cell: string;
  /** +1 adds, -1 subtracts. A credit line carried as a positive number is -1. */
  sign: 1 | -1;
};

/** A subtotal and the cells it claims to be the sum of. */
export type Rollup = {
  /** The id of the cell holding the stated subtotal. */
  id: string;
  parts: RollupPart[];
};

export type Statement = {
  id: string;
  label: string;
  /**
   * The precision the source reports to, in the same unit as the values.
   *
   * Figures printed in thousands with one decimal have a precision of 0.1.
   * This drives the tolerance, and it is read off the document rather than
   * configured, because a tolerance anyone can turn up is a gate that goes
   * green eventually.
   */
  precision: number;
  cells: Cell[];
  rollups: Rollup[];
};

/**
 * A single sign flip that would make a failing subtotal close.
 *
 * Reported rather than applied. A credit line typed as a debit is the most
 * common way a statement fails to reconcile, and naming the one cell that
 * would fix it turns "this does not add up" into a question the owner can
 * answer in ten seconds.
 */
export type Repair = {
  cell: string;
  from: 1 | -1;
  to: 1 | -1;
};

export type RollupStatus = "ok" | "mismatch" | "incomplete";

export type RollupCheck = {
  rollup: string;
  label: string;
  status: RollupStatus;
  stated: number | null;
  computed: number | null;
  /** stated minus computed. Positive means the document claims more. */
  drift: number | null;
  tolerance: number;
  /** Parts that carried a value. */
  counted: number;
  /** Parts that were blank or absent, which is why `incomplete` exists. */
  missing: string[];
  /**
   * Single sign flips that would close the gap.
   *
   * Exactly one means the diagnosis is near certain. None means the stated
   * figure does not follow from its own parts under any sign reading, which
   * is a stronger and more useful finding than a mismatch alone.
   */
  repairs: Repair[];
};

/**
 * green  every subtotal closes. Run everything.
 * amber  read, but something does not close. Name the cell and ask.
 * red    not enough here to check. Say why, mechanically, and charge nothing.
 */
export type GateStatus = "green" | "amber" | "red";

export type GateVerdict = {
  statement: string;
  status: GateStatus;
  checks: RollupCheck[];
  /** Cell ids that must be resolved before anything downstream runs. */
  blocking: string[];
  summary: string;
};

/** One figure that two statements disagree about. */
export type Disagreement = {
  cell: string;
  label: string;
  left: number | null;
  right: number | null;
  difference: number | null;
};
