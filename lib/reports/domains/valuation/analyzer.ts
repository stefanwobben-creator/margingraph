import {
  createAssumption,
  createClaim,
  createEvidence,
  deriveEvidence,
  type Analyzer,
  type Assumption,
  type Claim,
  type Evidence,
  type ModuleRef,
  type Provenance,
  type Quantity,
} from "@/lib/reports/kernel";
import {
  MULTIPLE_BAND_WIDTH,
  multipleBandFor,
} from "@/lib/reports/knowledge/valuation-2026-q3";

import type {
  Figure,
  ValuationInputs,
  ValuationJudgements,
} from "./inputs";
import { validateInputs } from "./inputs";
import {
  agreementBetween,
  assetBased,
  buildUpRate,
  capitalisedEarnings,
  marketMultiple,
  normalise,
  toEquityValue,
  type Range,
} from "./methods";

/**
 * The valuation domain module.
 *
 * Knows what EBITDA is. Knows nothing about confidence, evidence quality or
 * contradiction: those belong to the kernel, and an analyzer that graded its
 * own output would grade it generously every time.
 *
 * Its whole job is to turn figures into claims that each trace back to a cell
 * in the customer's file, a published dataset, or a named assumption. A claim
 * that traces to nothing is representable here, and the traceability reasoner
 * will say so in the report rather than the analyzer hiding it.
 */

const MODULE: ModuleRef = { id: "valuation", version: "1.0.0" };

const EUR = "EUR";

function euro(amount: number, band?: { low: number; high: number }): Quantity {
  return band
    ? { amount, unit: EUR, low: band.low, high: band.high }
    : { amount, unit: EUR };
}

function fromRange(r: Range): Quantity {
  return euro(r.central, { low: r.low, high: r.high });
}

function fileProvenance(figure: Figure): Provenance {
  return {
    type: "file",
    sourceId: figure.source.sourceId,
    filename: figure.source.filename,
    location: {
      sheet: figure.source.sheet,
      cell: figure.source.cell,
      page: figure.source.page,
      line: figure.source.line,
    },
    extractedBy: MODULE,
  };
}

/** Every figure the customer supplied becomes evidence with a location in their file. */
function figureEvidence(id: string, statement: string, figure: Figure): Evidence {
  return createEvidence({
    id,
    kind: "measured",
    statement,
    value: euro(figure.amount),
    provenance: fileProvenance(figure),
  });
}

function judgement(input: {
  id: string;
  statement: string;
  value: Quantity;
  impact: Assumption["impact"];
  field: string;
  alternatives?: Quantity[];
}): Assumption {
  return createAssumption({
    id: input.id,
    statement: input.statement,
    origin: "user",
    impact: input.impact,
    provenance: { type: "user", field: input.field },
    value: input.value,
    alternatives: input.alternatives,
  });
}

/** Rounded for prose only. Nothing downstream computes from these strings. */
function eur(amount: number): string {
  return `€${Math.round(amount).toLocaleString("en-GB")}`;
}

export function createValuationAnalyzer(input: {
  inputs: ValuationInputs;
  judgements: ValuationJudgements;
  /** Equity risk premium, supplied by the caller from the knowledge snapshot. */
  equityRiskPremium: number;
}): Analyzer {
  return {
    ...MODULE,
    domain: "valuation",

    async analyze() {
      const { inputs, judgements, equityRiskPremium } = input;

      const problems = validateInputs(inputs, judgements);
      if (problems.length > 0) {
        // Refusing is the right failure. A valuation built on figures that
        // cannot be right is worse than no valuation, because it looks fine.
        throw new Error(
          `Cannot value this business: ${problems
            .map((p) => `${p.field} ${p.problem}`)
            .join("; ")}.`,
        );
      }

      const evidence: Evidence[] = [
        figureEvidence("ev-revenue", `Revenue for ${inputs.period}.`, inputs.revenue),
        figureEvidence("ev-ebitda", `Reported EBITDA for ${inputs.period}.`, inputs.ebitda),
        figureEvidence(
          "ev-da",
          `Depreciation and amortisation for ${inputs.period}.`,
          inputs.depreciationAndAmortisation,
        ),
        figureEvidence(
          "ev-owner-pay",
          `Salary and benefits taken by the current owner in ${inputs.period}.`,
          inputs.ownerRemuneration,
        ),
        figureEvidence("ev-net-assets", "Net assets on the balance sheet.", inputs.netAssets),
        figureEvidence("ev-cash", "Cash held at the balance sheet date.", inputs.cash),
        figureEvidence(
          "ev-debt",
          "Interest-bearing debt at the balance sheet date.",
          inputs.interestBearingDebt,
        ),
      ];

      if (inputs.oneOffCosts) {
        evidence.push(
          figureEvidence(
            "ev-one-offs",
            "Costs identified as not recurring under a new owner.",
            inputs.oneOffCosts,
          ),
        );
      }

      /* ---------------------------------------------------- normalisation */

      const norm = normalise({
        ebitda: inputs.ebitda.amount,
        depreciationAndAmortisation: inputs.depreciationAndAmortisation.amount,
        ownerRemuneration: inputs.ownerRemuneration.amount,
        marketRateSalary: judgements.marketRateSalary,
        oneOffCosts: inputs.oneOffCosts?.amount,
      });

      const assumptions: Assumption[] = [
        judgement({
          id: "as-market-salary",
          statement: `A hired manager doing the owner's job would cost ${eur(
            judgements.marketRateSalary,
          )} a year. This is the single most contested figure in most negotiations.`,
          value: euro(judgements.marketRateSalary),
          impact: "weakens",
          field: "marketRateSalary",
        }),
        judgement({
          id: "as-capex",
          statement:
            "Maintenance capital expenditure is roughly equal to depreciation, so post-tax operating profit stands in for distributable cash. This understates a business that has just finished investing.",
          value: { amount: 1, unit: "count" },
          impact: "weakens",
          field: "capexAssumption",
        }),
        judgement({
          id: "as-going-concern",
          statement:
            "The business continues trading as it does today, with the current owner replaced rather than removed.",
          value: { amount: 1, unit: "count" },
          impact: "inverts",
          field: "goingConcern",
        }),
      ];

      const evAdjusted = deriveEvidence({
        id: "ev-adjusted-ebitda",
        statement: `Adjusted EBITDA of ${eur(norm.adjustedEbitda)}: reported ${eur(
          norm.reportedEbitda,
        )}, plus owner remuneration of ${eur(norm.ownerRemuneration)}, less a market-rate salary of ${eur(
          norm.marketRateSalary,
        )}, plus one-off costs of ${eur(norm.oneOffCosts)}.`,
        from: ["ev-ebitda", "ev-owner-pay", "ev-one-offs"],
        by: MODULE,
        value: euro(norm.adjustedEbitda),
      });
      evidence.push(evAdjusted);

      const claims: Claim[] = [
        createClaim({
          id: "cl-adjusted-ebitda",
          subject: "company",
          metric: "adjusted_ebitda",
          statement: `The business earns ${eur(
            norm.adjustedEbitda,
          )} a year for an owner who does not work in it.`,
          value: euro(norm.adjustedEbitda),
          evidence: ["ev-ebitda", "ev-owner-pay", "ev-adjusted-ebitda"],
          assumptions: ["as-market-salary"],
          derivedFrom: [],
          producedBy: MODULE,
          tags: ["earnings", "headline"],
        }),
      ];

      /* -------------------------------------------------- method 1: market */

      const band = multipleBandFor(norm.adjustedEbitda);

      evidence.push(
        createEvidence({
          id: "ev-multiple",
          kind: "external",
          statement: `Dutch businesses at ${band.label} transacted at an average of ${band.multiple}× EBITDA, per the Brookz Overname Barometer H1-2025, a survey of Dutch M&A advisors.`,
          value: { amount: band.multiple, unit: "x" },
          provenance: {
            type: "knowledge",
            dataset: "nl-ebitda-multiple",
            snapshot: "2026-q3",
            key: String(norm.adjustedEbitda),
          },
        }),
      );

      assumptions.push(
        judgement({
          id: "as-band-width",
          statement: `The multiple is treated as ${band.multiple} plus or minus ${MULTIPLE_BAND_WIDTH}. No publisher of SME multiples reports a confidence interval, so this width is our choice and not a measurement.`,
          value: { amount: MULTIPLE_BAND_WIDTH, unit: "x" },
          impact: "weakens",
          field: "multipleBandWidth",
          alternatives: [
            { amount: 0.5, unit: "x" },
            { amount: 1.5, unit: "x" },
          ],
        }),
        judgement({
          id: "as-comparability",
          statement:
            "The surveyed transactions are comparable to this business. They are Dutch and in the same earnings band; sector, growth and customer mix are not controlled for in the published data.",
          value: { amount: 1, unit: "count" },
          impact: "weakens",
          field: "comparability",
        }),
      );

      const marketEnterprise = marketMultiple({
        adjustedEbitda: norm.adjustedEbitda,
        multiple: band.multiple,
        bandWidth: MULTIPLE_BAND_WIDTH,
      });
      const marketEquity = toEquityValue(marketEnterprise, {
        cash: inputs.cash.amount,
        interestBearingDebt: inputs.interestBearingDebt.amount,
      });

      claims.push(
        createClaim({
          id: "cl-market-multiple",
          subject: "company",
          metric: "equity_value",
          statement: `Against comparable Dutch transactions, the shares are worth ${eur(
            marketEquity.low,
          )} to ${eur(marketEquity.high)}.`,
          value: fromRange(marketEquity),
          evidence: ["ev-adjusted-ebitda", "ev-multiple", "ev-cash", "ev-debt"],
          assumptions: ["as-band-width", "as-comparability", "as-market-salary"],
          derivedFrom: ["cl-adjusted-ebitda"],
          producedBy: MODULE,
          tags: ["method", "market", "headline"],
        }),
      );

      /* --------------------------------------------- method 2: capitalised */

      const rateLow = buildUpRate({
        riskFreeRate: judgements.riskFreeRate,
        equityRiskPremium,
        sizePremium: judgements.sizePremium,
        companySpecificRisk: judgements.companySpecificRisk.low,
      });
      const rateHigh = buildUpRate({
        riskFreeRate: judgements.riskFreeRate,
        equityRiskPremium,
        sizePremium: judgements.sizePremium,
        companySpecificRisk: judgements.companySpecificRisk.high,
      });

      assumptions.push(
        judgement({
          id: "as-csr",
          statement: `A company-specific risk premium of ${(
            judgements.companySpecificRisk.low * 100
          ).toFixed(1)}% to ${(judgements.companySpecificRisk.high * 100).toFixed(
            1,
          )}%. NACVA's own guidance states there is no easily identifiable data source for this figure and that it is a matter of professional judgment. It is shown as a range for that reason.`,
          value: {
            amount: (judgements.companySpecificRisk.low + judgements.companySpecificRisk.high) / 2,
            unit: "%",
            low: judgements.companySpecificRisk.low,
            high: judgements.companySpecificRisk.high,
          },
          impact: "weakens",
          field: "companySpecificRisk",
        }),
        judgement({
          id: "as-size-premium",
          statement: `A size premium of ${(judgements.sizePremium * 100).toFixed(
            1,
          )}%. Published size premia are derived from portfolios of listed companies and do not transfer cleanly to an owner-managed business.`,
          value: { amount: judgements.sizePremium, unit: "%" },
          impact: "weakens",
          field: "sizePremium",
        }),
      );

      evidence.push(
        createEvidence({
          id: "ev-discount-rate",
          kind: "derived",
          statement: `Discount rate of ${(rateLow.total * 100).toFixed(1)}% to ${(
            rateHigh.total * 100
          ).toFixed(1)}%: risk-free ${(judgements.riskFreeRate * 100).toFixed(
            1,
          )}%, equity risk premium ${(equityRiskPremium * 100).toFixed(1)}%, size premium ${(
            judgements.sizePremium * 100
          ).toFixed(1)}%, company-specific ${(
            judgements.companySpecificRisk.low * 100
          ).toFixed(1)}% to ${(judgements.companySpecificRisk.high * 100).toFixed(1)}%.`,
          value: {
            amount: (rateLow.total + rateHigh.total) / 2,
            unit: "%",
            low: rateLow.total,
            high: rateHigh.total,
          },
          provenance: { type: "derived", from: ["as-csr", "as-size-premium"], by: MODULE },
        }),
      );

      const capitalisedEnterprise = capitalisedEarnings({
        adjustedEbit: norm.adjustedEbit,
        taxRate: judgements.taxRate,
        rateLow: rateLow.total,
        rateHigh: rateHigh.total,
      });
      const capitalisedEquity = toEquityValue(capitalisedEnterprise, {
        cash: inputs.cash.amount,
        interestBearingDebt: inputs.interestBearingDebt.amount,
      });

      claims.push(
        createClaim({
          id: "cl-capitalised",
          subject: "company",
          metric: "equity_value",
          statement: `Capitalising post-tax operating profit, the shares are worth ${eur(
            capitalisedEquity.low,
          )} to ${eur(capitalisedEquity.high)}.`,
          value: fromRange(capitalisedEquity),
          evidence: ["ev-adjusted-ebitda", "ev-discount-rate", "ev-da", "ev-cash", "ev-debt"],
          assumptions: ["as-csr", "as-size-premium", "as-capex", "as-market-salary"],
          derivedFrom: ["cl-adjusted-ebitda"],
          producedBy: MODULE,
          tags: ["method", "income", "headline"],
        }),
      );

      /* -------------------------------------------------- method 3: assets */

      const assets = assetBased(inputs.netAssets.amount);

      claims.push(
        createClaim({
          id: "cl-asset-based",
          subject: "company",
          metric: "asset_value",
          statement: `What the business owns, less what it owes, comes to ${eur(
            assets.central,
          )}. Treat this as a floor rather than a valuation.`,
          value: euro(assets.central),
          evidence: ["ev-net-assets"],
          assumptions: ["as-going-concern"],
          derivedFrom: [],
          producedBy: MODULE,
          tags: ["method", "assets"],
        }),
      );

      /* ------------------------------------------------------- agreement  */

      const agreement = agreementBetween(marketEquity, capitalisedEquity);

      // A conclusion drawn from two methods rests on everything those methods
      // rest on. Citing only `derivedFrom` would leave the headline claim
      // looking unsupported next to the very figures that support it, because
      // nothing in the kernel can see through a derivation — correctly, since
      // "derived from" does not imply "inherits the grounds of".
      const methodClaims = claims.filter(
        (c) => c.id === "cl-market-multiple" || c.id === "cl-capitalised",
      );
      const inherited = <K extends "evidence" | "assumptions">(key: K): string[] => [
        ...new Set(methodClaims.flatMap((c) => c[key] as string[])),
      ];

      if (agreement.kind === "overlap") {
        claims.push(
          createClaim({
            id: "cl-agreement",
            subject: "company",
            metric: "equity_value",
            statement: `Both earnings-based methods land between ${eur(
              agreement.low,
            )} and ${eur(agreement.high)}. That overlap is the defensible range.`,
            value: euro((agreement.low + agreement.high) / 2, {
              low: agreement.low,
              high: agreement.high,
            }),
            evidence: inherited("evidence"),
            assumptions: inherited("assumptions"),
            derivedFrom: ["cl-market-multiple", "cl-capitalised"],
            producedBy: MODULE,
            tags: ["conclusion", "headline"],
          }),
        );
      } else {
        claims.push(
          createClaim({
            id: "cl-disagreement",
            subject: "company",
            metric: "equity_value",
            // Not a defect in the report. Two methods that miss each other
            // mean an input is wrong, and knowing which question to ask is
            // worth more than a number that splits the difference.
            statement: `The two earnings-based methods do not meet: they are ${eur(
              agreement.gap,
            )} apart. Before using either figure, find out which input is wrong.`,
            value: euro(agreement.gap),
            evidence: inherited("evidence"),
            assumptions: inherited("assumptions"),
            derivedFrom: ["cl-market-multiple", "cl-capitalised"],
            producedBy: MODULE,
            conflictsWith: ["cl-market-multiple", "cl-capitalised"],
            tags: ["conclusion", "headline", "warning"],
          }),
        );
      }

      if (assets.central > marketEquity.high && assets.central > capitalisedEquity.high) {
        claims.push(
          createClaim({
            id: "cl-worth-more-dead",
            subject: "company",
            metric: "asset_value",
            statement: `Net assets of ${eur(
              assets.central,
            )} exceed every earnings-based valuation. On these figures the business is worth more broken up than continued.`,
            value: euro(assets.central),
            evidence: ["ev-net-assets"],
            assumptions: ["as-going-concern"],
            derivedFrom: ["cl-asset-based", "cl-market-multiple", "cl-capitalised"],
            producedBy: MODULE,
            tags: ["conclusion", "warning"],
          }),
        );
      }

      return { claims, evidence, assumptions };
    },
  };
}
