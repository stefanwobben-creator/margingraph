import { runPipeline, type Report, type SourceId } from "@/lib/reports/kernel";
import { valuationKnowledge } from "@/lib/reports/knowledge/valuation-2026-q3";
import { createValuationAnalyzer } from "@/lib/reports/domains/valuation/analyzer";
import type {
  Figure,
  ValuationInputs,
  ValuationJudgements,
} from "@/lib/reports/domains/valuation/inputs";
import { businessValuationTemplate } from "@/lib/reports/templates/business-valuation";

/**
 * One invented business, valued by the real pipeline.
 *
 * Nothing here is a mock. The figures are made up; every number derived from
 * them is produced by the same analyzer, the same knowledge snapshot and the
 * same reasoning engine that a paying customer's file goes through. If the
 * example looks wrong, the product is wrong, which is the only way an example
 * is worth showing.
 *
 * The business is deliberately ordinary: a profitable Dutch service company
 * with one owner who underpays himself, a bit of debt and a real one-off cost.
 * That combination is where a naive multiple goes furthest wrong.
 */

export const EXAMPLE_BUSINESS = {
  name: "A Dutch installation company",
  description:
    "Twelve staff, one owner who still sells, one financial year of clean accounts.",
} as const;

function figure(amount: number, sheet: string, cell: string): Figure {
  return {
    amount,
    source: {
      sourceId: "example" as SourceId,
      filename: "jaarrekening-2025.xlsx",
      sheet,
      cell,
    },
  };
}

export const exampleInputs: ValuationInputs = {
  period: "2025",
  revenue: figure(1_200_000, "P&L", "B4"),
  ebitda: figure(240_000, "P&L", "B18"),
  depreciationAndAmortisation: figure(35_000, "P&L", "B19"),
  ownerRemuneration: figure(60_000, "P&L", "B12"),
  oneOffCosts: figure(25_000, "P&L", "B22"),
  netAssets: figure(310_000, "Balance", "B30"),
  cash: figure(80_000, "Balance", "B8"),
  interestBearingDebt: figure(150_000, "Balance", "B24"),
};

export const exampleJudgements: ValuationJudgements = {
  marketRateSalary: 90_000,
  taxRate: 0.258,
  riskFreeRate: 0.028,
  sizePremium: 0.04,
  companySpecificRisk: { low: 0, high: 0.08 },
};

/** Damodaran's implied equity risk premium, from the same snapshot. */
export const EXAMPLE_EQUITY_RISK_PREMIUM = 0.046;

/**
 * Generated at build time, so the page is static and the example cannot drift
 * away from the code that produced it. A fixed timestamp keeps the output
 * byte-identical between builds.
 */
export function buildExampleReport(): Promise<Report> {
  return runPipeline({
    reportId: "example-business-valuation",
    generatedAt: "2026-07-28T09:00:00.000Z",
    template: businessValuationTemplate,
    analyzer: createValuationAnalyzer({
      inputs: exampleInputs,
      judgements: exampleJudgements,
      equityRiskPremium: EXAMPLE_EQUITY_RISK_PREMIUM,
    }),
    knowledge: valuationKnowledge,
    evidence: [],
    assumptions: [],
    inputDigest: "example",
  });
}
