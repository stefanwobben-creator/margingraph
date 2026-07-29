/**
 * A finding is the product. Everything else is plumbing.
 *
 * The shape is fixed at four things because that is what an owner can act on:
 * what is true, what it is worth, what to do, and where it came from. No
 * confidence band, no method comparison, no chapter. Those are a machine
 * explaining itself, and nobody asked.
 *
 * `workings` exists so the number can be checked by hand in ten seconds. A
 * figure an owner cannot re-derive is a figure they will not act on.
 */
export type Finding = {
  id: string;
  /** One sentence: what is true about their figures. */
  observation: string;
  /** Euros. Always read together with `per`, never annualised silently. */
  worth: number;
  /**
   * The period the amount belongs to, in the source's own words.
   *
   * A quarterly figure printed as "per jaar" is a four-fold overstatement and
   * the first thing a reader would catch. Rules take this from the period they
   * were given rather than guessing at an annual equivalent.
   */
  per: string;
  /** What to do on Monday. Never "consider", never "review". */
  action: string;
  /** The arithmetic, so the reader can redo it. */
  workings: string;
  /** Cell ids this came from, for linking back to their own file. */
  source: string[];
  /**
   * Rules that fire on a suspicion rather than a certainty mark themselves.
   * A soft finding still has to carry a euro amount; it just says out loud
   * that the amount rests on an assumption the reader can overturn.
   */
  caveat?: string;
};

/**
 * A period of figures, flat and named.
 *
 * Deliberately not a chart of accounts. The rules below work on whatever the
 * gate managed to read, and a rule that cannot find its inputs returns nothing
 * rather than guessing at them.
 */
export type Period = {
  label: string;
  /** Cell id to value. Absent means the line was not in the file. */
  values: Record<string, number>;
  /** The turnover line, needed to turn anything into a percentage. */
  revenueKey: string;
};

export type FindingsInput = {
  /** What actually happened, or the latest trend. */
  actual: Period;
  /** Budget or prior year, if the file had one. Many rules need it. */
  reference?: Period;
  /**
   * Cost lines that are recovered from customers, paired with the line that
   * recovers them. Freight billed out against freight paid is the canonical
   * case and it is worth a point of margin at most trading companies.
   */
  recoveries?: { cost: string; recovery: string; label: string }[];
  /**
   * Cost lines you would expect to move with volume: outsourced logistics,
   * freight, commission, packaging, payment fees.
   *
   * Payroll and rent do not belong here. Run the drift rule over payroll and
   * it will report that wages are too high in a quarter where wages came in
   * under budget, because turnover fell and the ratio moved. Confidently wrong
   * is worse than silent.
   */
  variableLines?: { key: string; label: string }[];
  /** Every cost line, for the plain budget comparison. */
  costLines?: { key: string; label: string }[];
};
