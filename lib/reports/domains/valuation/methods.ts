/**
 * The three valuation methods, as arithmetic.
 *
 * No provenance, no claims, no language model: given the same numbers these
 * functions return the same answer forever, which is what makes the whole
 * report reproducible and testable. Everything that requires judgement is a
 * parameter, so you can read this file and see exactly which inputs move the
 * answer and by how much.
 *
 * Each method returns a range. None of them returns a point, because none of
 * them knows anything to a point.
 */

export type Range = { low: number; central: number; high: number };

export function range(low: number, central: number, high: number): Range {
  // Ordering is a postcondition, not a hope: a range printed back to front is
  // the kind of thing a reader spots before a test does.
  if (!(low <= central && central <= high)) {
    throw new Error(
      `Range out of order: low ${low}, central ${central}, high ${high}.`,
    );
  }
  return { low, central, high };
}

/* -------------------------------------------------------------------------- */
/* Normalisation                                                               */
/* -------------------------------------------------------------------------- */

export type Normalisation = {
  reportedEbitda: number;
  ownerRemuneration: number;
  marketRateSalary: number;
  oneOffCosts: number;
  adjustedEbitda: number;
  adjustedEbit: number;
};

/**
 * What the business earns for someone who is not you.
 *
 * Add back what the owner took out, subtract what a hired manager would cost,
 * add back costs that will not happen again. The third of those is where most
 * arguments in a sale happen, which is why the report lists every item rather
 * than presenting a single adjusted figure.
 */
export function normalise(input: {
  ebitda: number;
  depreciationAndAmortisation: number;
  ownerRemuneration: number;
  marketRateSalary: number;
  oneOffCosts?: number;
}): Normalisation {
  const oneOffCosts = input.oneOffCosts ?? 0;
  const adjustedEbitda =
    input.ebitda + input.ownerRemuneration - input.marketRateSalary + oneOffCosts;

  return {
    reportedEbitda: input.ebitda,
    ownerRemuneration: input.ownerRemuneration,
    marketRateSalary: input.marketRateSalary,
    oneOffCosts,
    adjustedEbitda,
    adjustedEbit: adjustedEbitda - input.depreciationAndAmortisation,
  };
}

/* -------------------------------------------------------------------------- */
/* Method 1 — market multiple                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Adjusted EBITDA times what comparable businesses transacted at.
 *
 * The width comes from us, not from the publisher. No source of SME multiples
 * publishes a confidence interval, so a single reported average is presented
 * here as a band and the report says whose choice that was.
 */
export function marketMultiple(input: {
  adjustedEbitda: number;
  multiple: number;
  bandWidth: number;
}): Range {
  const low = Math.max(0, input.multiple - input.bandWidth);
  return range(
    input.adjustedEbitda * low,
    input.adjustedEbitda * input.multiple,
    input.adjustedEbitda * (input.multiple + input.bandWidth),
  );
}

/* -------------------------------------------------------------------------- */
/* Method 2 — capitalised earnings                                             */
/* -------------------------------------------------------------------------- */

export type DiscountRate = {
  riskFreeRate: number;
  equityRiskPremium: number;
  sizePremium: number;
  companySpecificRisk: number;
  total: number;
};

/** The build-up method, with every component kept separate so it can be argued with. */
export function buildUpRate(input: {
  riskFreeRate: number;
  equityRiskPremium: number;
  sizePremium: number;
  companySpecificRisk: number;
}): DiscountRate {
  const total =
    input.riskFreeRate +
    input.equityRiskPremium +
    input.sizePremium +
    input.companySpecificRisk;
  return { ...input, total };
}

/**
 * Operating profit after tax, capitalised as a perpetuity.
 *
 * The simplification is that maintenance capital expenditure roughly equals
 * depreciation, so post-tax operating profit stands in for the cash a new
 * owner could take out indefinitely. That holds for an asset-light business
 * and understates the value of one that has just finished investing. The
 * report states the assumption rather than burying it.
 *
 * A higher rate at the top of the range produces the lower value, so the ends
 * cross over. Getting that backwards is the single easiest mistake in this
 * file, which is why the test suite checks the direction explicitly.
 */
export function capitalisedEarnings(input: {
  adjustedEbit: number;
  taxRate: number;
  rateLow: number;
  rateHigh: number;
}): Range {
  if (!(input.rateLow > 0 && input.rateHigh > 0)) {
    throw new Error("A discount rate of zero capitalises to infinity.");
  }
  if (input.rateLow > input.rateHigh) {
    throw new Error("rateLow must not exceed rateHigh.");
  }

  const nopat = input.adjustedEbit * (1 - input.taxRate);
  const central = (input.rateLow + input.rateHigh) / 2;

  return range(nopat / input.rateHigh, nopat / central, nopat / input.rateLow);
}

/* -------------------------------------------------------------------------- */
/* Method 3 — asset based                                                      */
/* -------------------------------------------------------------------------- */

/**
 * What is left after selling what the business owns and settling what it owes.
 *
 * This is a floor rather than a valuation. A business worth less than this is
 * worth more dead than alive, and that is a finding rather than a rounding
 * error, so the analyzer raises it as a claim in its own right.
 */
export function assetBased(netAssets: number): Range {
  return range(netAssets, netAssets, netAssets);
}

/* -------------------------------------------------------------------------- */
/* Bridge and consolidation                                                    */
/* -------------------------------------------------------------------------- */

/** Enterprise value is the business; equity value is what reaches your account. */
export function toEquityValue(
  enterprise: Range,
  input: { cash: number; interestBearingDebt: number },
): Range {
  const bridge = input.cash - input.interestBearingDebt;
  return range(
    enterprise.low + bridge,
    enterprise.central + bridge,
    enterprise.high + bridge,
  );
}

export type Overlap =
  | { kind: "overlap"; low: number; high: number }
  | { kind: "disjoint"; gap: number };

/**
 * Where the earnings-based methods agree.
 *
 * Two methods that overlap give a reader somewhere to stand. Two that do not
 * are the most useful output in the whole report, because it means one of the
 * inputs is wrong and the reader now knows to go and find out which. Averaging
 * them into a single number would hide exactly that.
 *
 * The asset-based figure is deliberately excluded: it measures something else
 * and would drag every range towards a floor it does not belong in.
 */
export function agreementBetween(a: Range, b: Range): Overlap {
  const low = Math.max(a.low, b.low);
  const high = Math.min(a.high, b.high);
  if (low <= high) return { kind: "overlap", low, high };
  return { kind: "disjoint", gap: low - high };
}
