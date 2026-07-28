import { describe, expect, it } from "vitest";

import { runPipeline, type SourceId } from "@/lib/reports/kernel";
import { valuationKnowledge } from "@/lib/reports/knowledge/valuation-2026-q3";
import { businessValuationTemplate } from "@/lib/reports/templates/business-valuation";

import { createValuationAnalyzer } from "../analyzer";
import type { Figure, ValuationInputs, ValuationJudgements } from "../inputs";
import {
  agreementBetween,
  assetBased,
  capitalisedEarnings,
  marketMultiple,
  normalise,
  range,
  toEquityValue,
} from "../methods";

/* -------------------------------------------------------------------------- */
/* A real-shaped business                                                      */
/* -------------------------------------------------------------------------- */

function figure(amount: number, cell: string): Figure {
  return {
    amount,
    source: {
      sourceId: "src-1" as SourceId,
      filename: "jaarrekening-2025.xlsx",
      sheet: "P&L",
      cell,
    },
  };
}

const inputs: ValuationInputs = {
  period: "2025",
  revenue: figure(1_200_000, "B4"),
  ebitda: figure(240_000, "B18"),
  depreciationAndAmortisation: figure(35_000, "B19"),
  ownerRemuneration: figure(60_000, "B12"),
  oneOffCosts: figure(25_000, "B22"),
  netAssets: figure(310_000, "Balance!B30"),
  cash: figure(80_000, "Balance!B8"),
  interestBearingDebt: figure(150_000, "Balance!B24"),
};

const judgements: ValuationJudgements = {
  marketRateSalary: 90_000,
  taxRate: 0.258,
  riskFreeRate: 0.028,
  sizePremium: 0.04,
  companySpecificRisk: { low: 0, high: 0.08 },
};

const ERP = 0.046;

function analyzer() {
  return createValuationAnalyzer({ inputs, judgements, equityRiskPremium: ERP });
}

function report() {
  return runPipeline({
    reportId: "rep-test",
    generatedAt: "2026-07-28T12:00:00.000Z",
    template: businessValuationTemplate,
    analyzer: analyzer(),
    knowledge: valuationKnowledge,
    evidence: [],
    assumptions: [],
    inputDigest: "digest-test",
  });
}

/* -------------------------------------------------------------------------- */

describe("normalisation", () => {
  it("earns what it earns for someone who does not work in it", () => {
    const norm = normalise({
      ebitda: 240_000,
      depreciationAndAmortisation: 35_000,
      ownerRemuneration: 60_000,
      marketRateSalary: 90_000,
      oneOffCosts: 25_000,
    });
    // 240 + 60 − 90 + 25
    expect(norm.adjustedEbitda).toBe(235_000);
    expect(norm.adjustedEbit).toBe(200_000);
  });

  it("treats an absent one-off as zero rather than as a missing number", () => {
    const norm = normalise({
      ebitda: 100_000,
      depreciationAndAmortisation: 0,
      ownerRemuneration: 50_000,
      marketRateSalary: 50_000,
    });
    expect(norm.adjustedEbitda).toBe(100_000);
  });
});

describe("the arithmetic of each method", () => {
  it("multiplies earnings by the band and widens it", () => {
    const r = marketMultiple({ adjustedEbitda: 235_000, multiple: 3.5, bandWidth: 1 });
    expect(r.low).toBe(587_500);
    expect(r.central).toBe(822_500);
    expect(r.high).toBe(1_057_500);
  });

  it("never produces a negative multiple however wide the band", () => {
    const r = marketMultiple({ adjustedEbitda: 100_000, multiple: 0.5, bandWidth: 2 });
    expect(r.low).toBe(0);
  });

  // The easiest mistake in the entire codebase: the high rate makes the low
  // value. Getting this backwards would overstate every valuation we produce.
  it("capitalises the high rate into the low value", () => {
    const r = capitalisedEarnings({
      adjustedEbit: 200_000,
      taxRate: 0.258,
      rateLow: 0.114,
      rateHigh: 0.194,
    });
    const nopat = 200_000 * 0.742;
    expect(r.low).toBeCloseTo(nopat / 0.194, 6);
    expect(r.high).toBeCloseTo(nopat / 0.114, 6);
    expect(r.low).toBeLessThan(r.high);
  });

  it("refuses a discount rate of zero rather than returning infinity", () => {
    expect(() =>
      capitalisedEarnings({ adjustedEbit: 1, taxRate: 0, rateLow: 0, rateHigh: 0.2 }),
    ).toThrow();
  });

  it("bridges enterprise value to equity value with cash and debt", () => {
    const equity = toEquityValue(range(100, 200, 300), {
      cash: 80_000,
      interestBearingDebt: 150_000,
    });
    expect(equity.central).toBe(200 - 70_000);
  });

  it("refuses to build a range that is out of order", () => {
    expect(() => range(10, 5, 20)).toThrow();
  });

  it("reports a gap rather than averaging methods that miss each other", () => {
    const disjoint = agreementBetween(range(100, 150, 200), range(400, 450, 500));
    expect(disjoint).toEqual({ kind: "disjoint", gap: 200 });

    const overlapping = agreementBetween(range(100, 200, 300), range(250, 400, 550));
    expect(overlapping).toEqual({ kind: "overlap", low: 250, high: 300 });
  });

  it("treats net assets as a point, because it is one", () => {
    const r = assetBased(310_000);
    expect(r).toEqual({ low: 310_000, central: 310_000, high: 310_000 });
  });
});

describe("the analyzer, end to end", () => {
  it("produces a report with every chapter the template asked for", async () => {
    const result = await report();
    expect(result.chapters.map((c) => c.id)).toEqual([
      "gaps",
      "conclusion",
      "earnings",
      "methods",
      "levers",
      "warnings",
    ]);
  });

  // This is the property that decides whether the product is a method or a
  // generator. A customer who uploads the same file twice and gets two
  // different answers has learned that neither was worth anything.
  it("gives byte-identical answers for the same input", async () => {
    const [a, b] = await Promise.all([report(), report()]);
    const values = (r: Awaited<ReturnType<typeof report>>) =>
      r.claimSet.claims.map((c) => [c.id, c.value?.amount, c.value?.low, c.value?.high]);
    expect(values(a)).toEqual(values(b));
  });

  it("states a range for both earnings-based methods, never a point", async () => {
    const result = await report();
    for (const id of ["cl-market-multiple", "cl-capitalised"]) {
      const claim = result.claimSet.claims.find((c) => c.id === id);
      expect(claim, `${id} is missing`).toBeDefined();
      expect(claim?.value?.low, `${id} has no low`).toBeDefined();
      expect(claim?.value?.high, `${id} has no high`).toBeDefined();
      expect(claim!.value!.high).toBeGreaterThan(claim!.value!.low!);
    }
  });

  // The whole promise of the report is that any figure can be traced back.
  // A claim resting on nothing at all is the one thing that breaks it.
  it("grounds every claim in evidence, an assumption, or another claim", async () => {
    const result = await report();
    const ungrounded = result.claimSet.claims.filter(
      (c) =>
        c.evidence.length === 0 &&
        c.assumptions.length === 0 &&
        c.derivedFrom.length === 0,
    );
    expect(ungrounded.map((c) => c.id)).toEqual([]);
  });

  it("points every evidence and assumption reference at something that exists", async () => {
    const result = await report();
    const evidenceIds = new Set(result.claimSet.evidence.map((e) => e.id as string));
    const assumptionIds = new Set(result.claimSet.assumptions.map((a) => a.id as string));
    const claimIds = new Set(result.claimSet.claims.map((c) => c.id as string));

    for (const claim of result.claimSet.claims) {
      for (const id of claim.evidence) expect(evidenceIds, `${claim.id} → ${id}`).toContain(id);
      for (const id of claim.assumptions)
        expect(assumptionIds, `${claim.id} → ${id}`).toContain(id);
      for (const id of claim.derivedFrom) expect(claimIds, `${claim.id} → ${id}`).toContain(id);
    }
  });

  // The headline claim originally cited only `derivedFrom`, so the engine
  // scored its evidence quality at zero and the page showed "0%" next to
  // "reasonably grounded". The engine was right and the analyzer was wrong: a
  // conclusion rests on whatever the methods under it rest on.
  it("shows no claim whose supporting evidence scores zero", async () => {
    const result = await report();
    const shown = result.chapters.flatMap((chapter) => chapter.claims);
    expect(shown.length).toBeGreaterThan(0);
    const unsupported = shown
      .filter((entry) => entry.confidence.components.evidenceQuality === 0)
      .map((entry) => entry.claim.id);
    expect(unsupported).toEqual([]);
  });

  it("names the company-specific risk premium as an assumption, not a fact", async () => {
    const result = await report();
    const csr = result.claimSet.assumptions.find((a) => a.id === "as-csr");
    expect(csr).toBeDefined();
    expect(csr?.statement).toMatch(/no easily identifiable data source/);
  });

  it("records the knowledge snapshot so the report can be reproduced", async () => {
    const result = await report();
    expect(result.manifest.knowledge).toEqual({ "valuation-knowledge": "2026-q3" });
    expect(result.manifest.analyzer).toEqual({ id: "valuation", version: "1.0.0" });
  });

  it("names the misread row rather than valuing on it", async () => {
    const { claims } = await createValuationAnalyzer({
      inputs: { ...inputs, ebitda: figure(9_000_000, "B18") },
      judgements,
      equityRiskPremium: ERP,
    }).analyze({ evidence: [], assumptions: [], knowledge: valuationKnowledge });
    expect(claims.map((c) => c.id)).not.toContain("cl-market-multiple");
    expect(claims.find((c) => c.tags?.includes("gap"))?.statement).toMatch(
      /exceeds revenue/,
    );
  });

  // A revenue-only spreadsheet arrives looking like a business that earns
  // nothing and owns nothing, because a Figure cannot express "absent". Left
  // unchecked it values at zero with full confidence.
  it("returns a gap report for a file that has turnover and nothing else", async () => {
    const zero = (cell: string): Figure => ({ ...figure(0, cell) });
    const { claims } = await createValuationAnalyzer({
      inputs: {
        period: "2025",
        revenue: figure(2_437_547, "O156"),
        ebitda: zero("—"),
        depreciationAndAmortisation: zero("—"),
        ownerRemuneration: zero("—"),
        netAssets: zero("—"),
        cash: zero("—"),
        interestBearingDebt: zero("—"),
      },
      judgements,
      equityRiskPremium: ERP,
    }).analyze({ evidence: [], assumptions: [], knowledge: valuationKnowledge });
    expect(claims.some((c) => /cannot be valued on turnover alone/.test(c.statement))).toBe(
      true,
    );
    expect(claims.map((c) => c.id)).toContain("cl-gap-ladder");
  });

  // Two of the three methods multiply or capitalise earnings. Neither means
  // anything when there are none, and the reader needs to hear that as a fact
  // about the business rather than as a gap in our comparables data.
  it("drops the earnings methods once the owner is paid a market rate", async () => {
    const { claims } = await createValuationAnalyzer({
      inputs: { ...inputs, ebitda: figure(-2_766, "B18"), oneOffCosts: undefined },
      judgements: { ...judgements, marketRateSalary: 80_000 },
      equityRiskPremium: ERP,
    }).analyze({ evidence: [], assumptions: [], knowledge: valuationKnowledge });
    expect(claims.map((c) => c.id)).toContain("cl-asset-based");
    expect(claims.map((c) => c.id)).not.toContain("cl-capitalised");
    expect(claims.find((c) => c.tags?.includes("gap"))?.statement).toMatch(
      /adjusted EBITDA is -22766/,
    );
  });

  it("says so when the business is worth more broken up than continued", async () => {
    const assetHeavy = createValuationAnalyzer({
      inputs: {
        ...inputs,
        ebitda: figure(95_000, "B18"),
        netAssets: figure(2_000_000, "Balance!B30"),
      },
      judgements,
      equityRiskPremium: ERP,
    });
    const { claims } = await assetHeavy.analyze({
      evidence: [],
      assumptions: [],
      knowledge: valuationKnowledge,
    });
    expect(claims.map((c) => c.id)).toContain("cl-worth-more-dead");
  });
});

describe("the knowledge snapshot", () => {
  it("returns a multiple with a citation attached", async () => {
    const ev = await valuationKnowledge.lookup("nl-ebitda-multiple", "235000");
    expect(ev?.value?.amount).toBe(3.5);
    expect(ev?.statement).toMatch(/Brookz/);
    expect(ev?.provenance).toMatchObject({ type: "knowledge", snapshot: "2026-q3" });
  });

  it("returns nothing rather than guessing for an unknown dataset", async () => {
    expect(await valuationKnowledge.lookup("sector-multiples", "bakery")).toBeUndefined();
  });
});

/* -------------------------------------------------------------------------- */
/* Regression set: the first real files, and what each of them proved          */
/* -------------------------------------------------------------------------- */

describe("the files that could not be valued still produce a report", () => {
  const base = {
    period: "2025",
    depreciationAndAmortisation: figure(0, "-"),
    ownerRemuneration: figure(0, "-"),
    cash: figure(0, "-"),
    interestBearingDebt: figure(0, "-"),
  };

  // A weekly turnover workbook with seven tabs and no profit and loss in any
  // of them. The first version valued it at zero.
  it("turns a turnover-only file into a gap report with a margin ladder", async () => {
    const { claims } = await createValuationAnalyzer({
      inputs: {
        ...base,
        revenue: figure(2_437_547, "O156"),
        ebitda: figure(0, "-"),
        netAssets: figure(0, "-"),
      },
      judgements,
      equityRiskPremium: ERP,
    }).analyze({ evidence: [], assumptions: [], knowledge: valuationKnowledge });

    const ids = claims.map((c) => c.id);
    expect(ids).toContain("cl-gap-1");
    expect(ids).toContain("cl-gap-ladder");
    const ladder = claims.find((c) => c.id === "cl-gap-ladder");
    expect(ladder?.statement).toMatch(/profit and loss|5% →/);
    expect(ladder?.value?.low).toBeGreaterThan(0);
  });

  // Negative equity, a loss, and no salary anywhere in the profit and loss.
  it("gives a loss-making business its asset figure and skips the rest", async () => {
    const { claims } = await createValuationAnalyzer({
      inputs: {
        ...base,
        revenue: figure(58_013, "p9"),
        ebitda: figure(5_425, "p9"),
        depreciationAndAmortisation: figure(301, "p9"),
        netAssets: figure(519, "p8"),
        cash: figure(122_842, "p8"),
      },
      judgements: { ...judgements, marketRateSalary: 80_000 },
      equityRiskPremium: ERP,
    }).analyze({ evidence: [], assumptions: [], knowledge: valuationKnowledge });

    const ids = claims.map((c) => c.id);
    expect(ids).toContain("cl-asset-based");
    expect(ids).not.toContain("cl-market-multiple");
    expect(ids).not.toContain("cl-capitalised");
    expect(claims.find((c) => c.tags?.includes("gap"))?.statement).toMatch(
      /once the owner is paid a market rate/,
    );
  });

  // Management already on the payroll. The rule written for owner-managed
  // businesses charged the salary a second time.
  it("values a professionally managed business without charging a second salary", async () => {
    const { claims } = await createValuationAnalyzer({
      inputs: {
        ...base,
        revenue: figure(2_148_826, "p5"),
        ebitda: figure(161_576, "p5"),
        depreciationAndAmortisation: figure(5_707, "p5"),
        netAssets: figure(581_887, "p10"),
        cash: figure(68_200, "p9"),
        interestBearingDebt: figure(186_461, "p10"),
      },
      judgements: {
        ...judgements,
        marketRateSalary: 0,
        managementAlreadyEmployed: true,
      },
      equityRiskPremium: ERP,
    }).analyze({ evidence: [], assumptions: [], knowledge: valuationKnowledge });

    const market = claims.find((c) => c.id === "cl-market-multiple");
    expect(market?.value?.low).toBeCloseTo(285_679, -2);
    expect(market?.value?.high).toBeCloseTo(608_831, -2);
  });
});

describe("every lever is priced in euros of value", () => {
  it("multiplies a euro earned and does not multiply a euro repaid", async () => {
    const result = await report();
    const find = (id: string) => result.claimSet.claims.find((c) => c.id === id);

    // 3.5x at this size band: €10.000 of earnings, €35.000 of value.
    expect(find("lv-earnings")?.value?.amount).toBeCloseTo(35_000, 0);
    // Debt comes off one for one. This contrast is the whole point.
    expect(find("lv-debt")?.value?.amount).toBe(10_000);
    // One point of margin on €1.2m of turnover is €12.000, times 3.5.
    expect(find("lv-margin")?.value?.amount).toBeCloseTo(42_000, 0);

    expect(find("cl-leverage")?.statement).toMatch(/3\.5 times a euro of debt repaid/);
  });

  it("prices no lever when no earnings method applied", async () => {
    const { claims } = await createValuationAnalyzer({
      inputs: { ...inputs, ebitda: figure(-2_766, "B18"), oneOffCosts: undefined },
      judgements: { ...judgements, marketRateSalary: 80_000 },
      equityRiskPremium: ERP,
    }).analyze({ evidence: [], assumptions: [], knowledge: valuationKnowledge });
    expect(claims.filter((c) => c.tags?.includes("lever"))).toEqual([]);
  });
});
