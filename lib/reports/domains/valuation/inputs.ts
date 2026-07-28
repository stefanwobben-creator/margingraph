import type { SourceId } from "@/lib/reports/kernel";

/**
 * What the valuation analyzer needs, and where each number came from.
 *
 * Every figure arrives with a location in the uploaded file. That is not
 * bureaucracy: it is the only thing that lets the report answer "where did
 * this come from" for every number on the page, and it is the check that
 * catches a misread P&L before a confident, coherent and wrong report reaches
 * a customer.
 *
 * Nothing here is optional except the fields a business can genuinely lack.
 * A missing figure is a stated gap in the report, never a silent zero.
 */

export type FigureSource = {
  sourceId: SourceId;
  filename: string;
  sheet?: string;
  cell?: string;
  page?: number;
  line?: number;
};

export type Figure = {
  /** Euro, unless the caller says otherwise. */
  amount: number;
  source: FigureSource;
};

export type ValuationInputs = {
  /** Financial year the figures describe, e.g. "2025". */
  period: string;

  /* --- profit and loss --- */
  revenue: Figure;
  ebitda: Figure;
  depreciationAndAmortisation: Figure;

  /* --- normalisation --- */
  /** Salary and benefits the current owner actually took out. */
  ownerRemuneration: Figure;
  /** Costs that will not recur under a new owner, already identified. */
  oneOffCosts?: Figure;

  /* --- balance sheet --- */
  netAssets: Figure;
  cash: Figure;
  interestBearingDebt: Figure;
};

/**
 * Judgements the caller must make explicitly. None of them has a defensible
 * default, so none of them gets one: an analyzer that quietly picks a discount
 * rate is the thing this whole product exists to argue against.
 */
export type ValuationJudgements = {
  /**
   * What a hired manager would cost to do the owner's job.
   *
   * Zero is only valid together with `managementAlreadyEmployed`. An
   * owner-managed business whose salary line is left at zero produces
   * earnings that include unpaid labour, and every method downstream then
   * values work nobody is being paid for.
   */
  marketRateSalary: number;
  /**
   * Set when the business already employs its management at arm's length and
   * that cost is in the profit and loss account.
   *
   * Without this, the rule "a market-rate salary must be greater than zero"
   * is right for the owner-managed case and wrong for every business that has
   * already hired a general manager: it would charge the salary twice.
   */
  managementAlreadyEmployed?: boolean;
  /** Corporate tax rate applied to operating profit, as a fraction. */
  taxRate: number;
  /** Observable government bond yield at the valuation date, as a fraction. */
  riskFreeRate: number;
  /**
   * Extra return demanded for the size of the business, as a fraction.
   * Published size premia are derived from listed companies and do not
   * transfer cleanly. The report says so.
   */
  sizePremium: number;
  /**
   * The company-specific risk premium, as a range rather than a number.
   *
   * NACVA's own guidance states there is no easily identifiable data source
   * for this figure and that it is a matter of professional judgment. So it
   * enters as a range, is labelled an assumption, and the report shows what
   * each end of it does to the answer. That is the honest form of a number
   * nobody can source.
   */
  companySpecificRisk: { low: number; high: number };
};

/**
 * `blocking` means no method can run and the report is a gap report.
 * `method` means some methods cannot run but others still can: a business
 * that loses money still has a balance sheet, and saying so is worth more
 * than refusing outright.
 *
 * `unlocks` names the figure that would turn the gap into an answer. It is
 * the sentence the reader acts on, so it is a field rather than prose.
 */
export type ValidationIssue = {
  field: string;
  problem: string;
  severity: "blocking" | "method";
  unlocks?: string;
};

/**
 * Structural checks only. Nothing here judges whether a business is a good
 * business; it judges whether the numbers can support a valuation at all.
 */
export function validateInputs(
  inputs: ValuationInputs,
  judgements: ValuationJudgements,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!(inputs.revenue.amount > 0)) {
    issues.push({
      field: "revenue",
      problem: "must be greater than zero",
      severity: "blocking",
      unlocks: "turnover for the most recent financial year",
    });
  }
  if (!judgements.managementAlreadyEmployed && !(judgements.marketRateSalary > 0)) {
    issues.push({
      field: "marketRateSalary",
      problem:
        "must be greater than zero, or managementAlreadyEmployed must be set. " +
        "Earnings that contain unpaid owner labour are not earnings",
      severity: "blocking",
      unlocks: "what a hired manager would cost to do the owner's job",
    });
  }
  if (judgements.managementAlreadyEmployed && judgements.marketRateSalary !== 0) {
    issues.push({
      field: "marketRateSalary",
      problem:
        "must be zero when management is already employed, otherwise the same " +
        "salary is charged twice",
      severity: "blocking",
    });
  }

  const nonNegative: [string, number][] = [
    ["depreciationAndAmortisation", inputs.depreciationAndAmortisation.amount],
    ["ownerRemuneration", inputs.ownerRemuneration.amount],
    ["cash", inputs.cash.amount],
    ["interestBearingDebt", inputs.interestBearingDebt.amount],
  ];
  for (const [field, amount] of nonNegative) {
    if (amount < 0) {
      issues.push({ field, problem: "cannot be negative", severity: "blocking" });
    }
  }

  const fractions: [string, number][] = [
    ["taxRate", judgements.taxRate],
    ["riskFreeRate", judgements.riskFreeRate],
    ["sizePremium", judgements.sizePremium],
    ["companySpecificRisk.low", judgements.companySpecificRisk.low],
    ["companySpecificRisk.high", judgements.companySpecificRisk.high],
  ];
  for (const [field, value] of fractions) {
    if (value < 0 || value >= 1) {
      issues.push({
        field,
        problem: "must be a fraction between 0 and 1",
        severity: "blocking",
      });
    }
  }

  if (judgements.companySpecificRisk.low > judgements.companySpecificRisk.high) {
    issues.push({
      field: "companySpecificRisk",
      problem: "low must not exceed high",
      severity: "blocking",
    });
  }

  if (inputs.ebitda.amount > inputs.revenue.amount) {
    issues.push({
      field: "ebitda",
      problem: "exceeds revenue, which usually means a row was misread",
      severity: "blocking",
    });
  }

  /**
   * Absent is not zero, and this type cannot tell them apart: a `Figure`
   * always has an amount, so a file with no profit and loss in it arrives
   * looking like a business that earns nothing and owns nothing.
   *
   * Left unchecked that produces a valuation of zero, stated with the same
   * confidence as any other, which is the exact failure this product exists
   * to avoid. A real business with genuinely nil earnings, nil assets, nil
   * cash and nil debt does not exist; a revenue-only spreadsheet does.
   */
  const balanceSheet = [
    inputs.netAssets.amount,
    inputs.cash.amount,
    inputs.interestBearingDebt.amount,
  ];
  if (inputs.ebitda.amount === 0 && balanceSheet.every((amount) => amount === 0)) {
    issues.push({
      field: "ebitda, netAssets, cash, interestBearingDebt",
      problem:
        "are all zero, which means the file contains revenue but no profit and loss and no balance sheet. A business cannot be valued on turnover alone",
      severity: "blocking",
      unlocks: "a profit and loss account and a balance sheet for the same date",
    });
  }

  /**
   * A loss-making business has no earnings to multiply and no earnings to
   * capitalise, so two of the three methods do not apply to it at all.
   *
   * Caught here rather than downstream, because without this check the
   * failure surfaces as "no multiple band covers adjusted EBITDA of -82766"
   * from the knowledge lookup: true, useless, and it names the wrong problem.
   * The reader needs to be told that the business lost money once the owner
   * is paid a market wage, which is a fact about the business rather than a
   * gap in our reference data.
   */
  const adjustedEbitda =
    inputs.ebitda.amount +
    inputs.ownerRemuneration.amount -
    judgements.marketRateSalary +
    (inputs.oneOffCosts?.amount ?? 0);
  if (adjustedEbitda <= 0) {
    issues.push({
      field: "adjusted EBITDA",
      problem:
        `is ${Math.round(adjustedEbitda)} once the owner is paid a market rate. ` +
        "A business that does not earn cannot be valued on its earnings, so only " +
        "the asset-based figure applies",
      severity: "method",
      unlocks: "earnings above zero after a market-rate salary",
    });
  }

  return issues;
}
