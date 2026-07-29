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
export type LadderStep = {
  /** The move, in the owner's terms. */
  move: string;
  /** Euros per period, at the same period as the finding. */
  worth: number;
  /**
   * Revenue that can be lost before this step breaks even.
   *
   * A price rise that nobody notices is a price rise that was too small. This
   * says how much can walk away before the increase stops paying for itself,
   * which is the number that decides whether the step is safe.
   */
  breakEvenRevenue?: number;
  /** The same, as a share of turnover. Easier to judge than an amount. */
  breakEvenShare?: number;
};

export type Finding = {
  id: string;
  /**
   * What this kind of finding is, in ordinary words and with no figures in it.
   *
   * The reader we are writing for is the owner who sat through a meeting about
   * their own annual accounts and understood none of it. "You recover 55.5% of
   * your uitgaande vracht" assumes they already know that freight paid and
   * freight billed on are two different lines. Most do not, and the ones who
   * do lose nothing by being told.
   *
   * Deliberately free of their numbers, so it reads the same on every file and
   * can be checked once rather than argued with every time.
   */
  plainly?: string;
  /** One sentence: what is true about their figures. */
  observation: string;
  /**
   * What the finding is about, with no amount in it.
   *
   * Used for the locked lines in a teaser. A subject tells a reader whether
   * the rest is worth nine euros to them; an observation with the number still
   * in it is the finding itself, given away.
   */
  subject: string;
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
   * What a partial move is worth, and how much volume it can cost before it
   * stops being worth it.
   *
   * A situation usually exists for a reason. Outbound freight recovered at
   * 55% is not an oversight, it is a price the market was willing to pay, and
   * telling an owner to jump straight to full recovery is advice that ignores
   * the customers attached to it. A ladder converts the finding into something
   * an owner can actually do on Monday: a small step, what it earns, and how
   * much business it may cost before the step is a wash.
   */
  ladder?: LadderStep[];
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
  /**
   * Margin kept on the next euro of revenue, as a fraction.
   *
   * Needed to answer "how much volume can this cost me". Without it a ladder
   * still shows what each step earns, but not what it can safely cost, and the
   * rule says so rather than guessing at a number.
   */
  contributionMargin?: number;
  /** Every cost line, for the plain budget comparison. */
  costLines?: { key: string; label: string }[];
};
