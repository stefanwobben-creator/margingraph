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
  /** What a hired manager would cost to do the owner's job. */
  marketRateSalary: number;
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

export type ValidationIssue = { field: string; problem: string };

/**
 * Structural checks only. Nothing here judges whether a business is a good
 * business; it judges whether the numbers can support a valuation at all.
 */
export function validateInputs(
  inputs: ValuationInputs,
  judgements: ValuationJudgements,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const positive: [string, number][] = [
    ["revenue", inputs.revenue.amount],
    ["marketRateSalary", judgements.marketRateSalary],
  ];
  for (const [field, amount] of positive) {
    if (!(amount > 0)) issues.push({ field, problem: "must be greater than zero" });
  }

  const nonNegative: [string, number][] = [
    ["depreciationAndAmortisation", inputs.depreciationAndAmortisation.amount],
    ["ownerRemuneration", inputs.ownerRemuneration.amount],
    ["cash", inputs.cash.amount],
    ["interestBearingDebt", inputs.interestBearingDebt.amount],
  ];
  for (const [field, amount] of nonNegative) {
    if (amount < 0) issues.push({ field, problem: "cannot be negative" });
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
      issues.push({ field, problem: "must be a fraction between 0 and 1" });
    }
  }

  if (judgements.companySpecificRisk.low > judgements.companySpecificRisk.high) {
    issues.push({
      field: "companySpecificRisk",
      problem: "low must not exceed high",
    });
  }

  if (inputs.ebitda.amount > inputs.revenue.amount) {
    issues.push({
      field: "ebitda",
      problem: "exceeds revenue, which usually means a row was misread",
    });
  }

  return issues;
}
