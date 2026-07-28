import type { TemplateDefinition } from "@/lib/reports/kernel";

/**
 * The Business Valuation report.
 *
 * Configuration only. Chapter order is the argument the report makes, and it
 * runs deliberately backwards from how a valuation is usually presented: the
 * answer first, then the two methods that produced it, then everything that
 * could make it wrong.
 *
 * The last two chapters are the product. Anyone can multiply EBITDA by four.
 * Showing the reader which assumption to attack, and admitting where the
 * evidence runs out, is the part nobody else puts on the page.
 */
export const businessValuationTemplate: TemplateDefinition = {
  id: "business-valuation",
  version: "1.0.0",
  domain: "valuation",
  title: "What your business is worth, and why",
  audience:
    "An owner of a small or medium business who can read a P&L but does not value companies for a living.",
  tone: "Plain, direct, no hedging in the claims and no false precision in the numbers.",

  requiredInputs: [
    "profit and loss for the most recent financial year",
    "balance sheet at the same date",
    "salary and benefits taken by the owner",
  ],
  optionalInputs: [
    "costs that will not recur under a new owner",
    "a market-rate salary for the owner's role",
  ],

  chapters: [
    {
      // First, deliberately. When we cannot answer, the reason is the answer,
      // and burying it under three empty method sections wastes the only
      // useful thing the report contains.
      id: "gaps",
      title: "What we could not establish, and what would fix it",
      select: { tags: ["gap"] },
      emptyText:
        "Nothing was missing. Every figure this report needs was in your file.",
    },
    {
      id: "conclusion",
      title: "The range, and how much of it to believe",
      select: { tags: ["conclusion"] },
      emptyText:
        "No conclusion could be drawn from the figures supplied. That is a finding: see the gaps listed below.",
    },
    {
      id: "earnings",
      title: "What the business actually earns",
      select: { tags: ["earnings"] },
      emptyText:
        "Earnings could not be normalised, which usually means the owner's remuneration is missing from the file.",
    },
    {
      id: "methods",
      title: "The three methods, side by side",
      select: { tags: ["method"] },
      emptyText: "No valuation method could be applied to these figures.",
    },
    {
      id: "warnings",
      // Distinct from the counterargument section, which the engine produces
      // from declared assumptions. This chapter is for flags the figures
      // themselves raise: two methods that miss each other, assets worth more
      // than the trade.
      title: "Flags your own figures raise",
      select: { tags: ["warning"] },
      emptyText:
        "Nothing in these figures contradicts anything else in them. That is not the same as the answer being right.",
    },
  ],
};
