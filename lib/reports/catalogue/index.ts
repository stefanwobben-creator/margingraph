import { MINIMUM_WORTH, render } from "@/lib/reports/findings";
import type { FindingsInput } from "@/lib/reports/findings";
import { findAll } from "@/lib/reports/findings/rules";
import { questionsForYourAccountant } from "@/lib/reports/questions";
import { runwayReport } from "@/lib/reports/runway";
import { whySignalsBlocked } from "@/lib/reports/signals";
import { buildModel } from "@/lib/reports/whatif";

export type ReportId =
  | "margin"
  | "accountant"
  | "shock"
  | "pricing"
  | "runway"
  | "valuation"
  | "inventory"
  | "signals"
  | "contract";

/**
 * What we have, from one file.
 *
 * The bundle price only means something if the engine can say, before anybody
 * pays, which reports it can actually produce from what was sent. Offering
 * three for €21 and then delivering two is worse than not offering it.
 */
export type Supplied = {
  input?: FindingsInput;
  /** Bank balance today, if they gave it. Runway needs it and nothing else does. */
  cash?: number;
  /** How many annual periods were supplied. Valuation needs three. */
  years?: number;
};

export type ReportDefinition = {
  id: ReportId;
  title: string;
  /** The question in the owner's words, which is how it is listed. */
  question: string;
  /** What to send for it, in one line. */
  needs: string;
  /**
   * Whether the code to produce it exists yet.
   *
   * On the list on purpose. A catalogue that quietly omits the unbuilt ones
   * makes it easy to forget which promises are real, and a catalogue that
   * offers them makes it easy to sell one by accident.
   */
  built: boolean;
  /** Why this file cannot produce it, or undefined when it can. */
  blocked: (supplied: Supplied) => string | undefined;
};

/**
 * The what-ifs need a believable model of which costs flex: a gross margin
 * line, and costs the reader managed to place into steps. `buildModel` is the
 * single arbiter, so the gate and the report can never disagree about whether
 * the report is possible.
 */
const needsModel = (supplied: Supplied) =>
  !supplied.input
    ? "no readable figures"
    : supplied.input.contributionMargin === undefined
      ? "no gross margin line in the file, so we cannot tell which costs would flex"
      : buildModel(supplied.input) === undefined
        ? "we could not place your costs into steps, so we cannot say which would flex"
        : undefined;

export const REPORTS: readonly ReportDefinition[] = [
  {
    id: "margin",
    title: "Where your margin is leaking",
    question: "Where is my margin leaking?",
    needs: "Profit and loss for this period, plus the budget or the same period last year.",
    built: true,
    blocked: (s) => (!s.input ? "no readable figures" : undefined),
  },
  {
    id: "accountant",
    title: "What to ask your accountant",
    question: "What do I ask my accountant?",
    needs: "The same profit and loss account. Nothing else.",
    built: true,
    blocked: (s) => (!s.input ? "no readable figures" : undefined),
  },
  {
    id: "shock",
    title: "What a 20% drop would do",
    question: "What happens if turnover drops?",
    needs: "The same profit and loss account, including a gross margin line.",
    built: true,
    blocked: needsModel,
  },
  {
    id: "pricing",
    title: "How much volume a price rise can cost",
    question: "What can I afford to lose if I raise prices?",
    needs: "The same profit and loss account, including a gross margin line.",
    built: true,
    blocked: (s) =>
      !s.input
        ? "no readable figures"
        : s.input.contributionMargin === undefined
          ? "no gross margin in the file, so we cannot price what a change may cost"
          : undefined,
  },
  {
    id: "runway",
    title: "How long the money lasts",
    question: "How long does the money last?",
    needs: "The same profit and loss account, plus what is in the bank today.",
    built: true,
    // `runwayReport` is the single arbiter of whether the result can be
    // rebuilt from the lines we read, so the gate and the report can never
    // disagree about whether the report is possible.
    blocked: (s) =>
      !s.input
        ? "no readable figures"
        : s.cash === undefined
          ? "no bank balance given, and there is no cash in a profit and loss account"
          : runwayReport(s.input, { cash: s.cash }) === undefined
            ? "we could not rebuild an operating result from these lines"
            : undefined,
  },
  {
    id: "valuation",
    title: "What your business is worth",
    question: "What is my business worth?",
    needs: "Annual accounts for three years, including balance sheets, and owner pay.",
    built: false,
    blocked: (s) =>
      (s.years ?? 0) < 3 ? "we need three years of annual accounts, with balance sheets" : undefined,
  },
  {
    id: "inventory",
    title: "What your stock is quietly costing",
    question: "Is my stock working for me?",
    needs: "Annual accounts with a balance sheet: stock, plus cost of sales.",
    built: false,
    blocked: (s) => (!s.input ? "no readable figures" : undefined),
  },
  {
    id: "signals",
    title: "The health signals in your accounts",
    question: "Is my business getting stronger or weaker?",
    needs: "This year's profit and loss with last year beside it. Balance sheets complete the nine.",
    built: true,
    // `whySignalsBlocked` is shared with the report itself, so the gate and
    // the report can never disagree about whether the report is possible.
    blocked: (s) => whySignalsBlocked(s.input),
  },
  {
    id: "contract",
    title: "Is this contract reasonable",
    question: "Should I sign this?",
    needs: "The quote or agreement, and roughly what volume you do.",
    // Available, not automated: a contract is prose, and prose is read by a
    // person here. Marked built so the honest reason shows instead of the
    // generic one, and blocked always, so the machine can never sell it.
    built: true,
    blocked: () => "read by a person for now; send it and we reply the same way",
  },
] as const;

export type Offer = {
  id: ReportId;
  title: string;
  question: string;
  /** True when we can produce it and it clears the minimum. */
  sellable: boolean;
  /** Why not, in the sender's words. Absent when it is sellable. */
  because?: string;
};

/**
 * What this file can actually be turned into.
 *
 * Three separate gates, in order, because they fail for different reasons and
 * the sender deserves the real one: is the code written, do we have the
 * inputs, and did it find enough to be worth charging for. A report that runs
 * and finds nothing is not blocked, it is free, and saying "we cannot produce
 * that" would be a lie about a clean result.
 */
export function offer(supplied: Supplied): Offer[] {
  return REPORTS.map((report) => {
    const base = { id: report.id, title: report.title, question: report.question };

    if (!report.built) {
      return { ...base, sellable: false, because: "not built yet" };
    }

    const blocked = report.blocked(supplied);
    if (blocked) return { ...base, sellable: false, because: blocked };

    const worth = worthOf(report.id, supplied);
    if (worth !== undefined && worth < MINIMUM_WORTH) {
      return {
        ...base,
        sellable: false,
        because: `we found less than €${MINIMUM_WORTH} worth acting on, so this one is free`,
      };
    }

    return { ...base, sellable: true };
  });
}

/**
 * What a report is worth, where that question means anything.
 *
 * Undefined rather than zero for the reports whose value is not an amount.
 * The questions for your accountant are worth having or they are not; pricing
 * them in euros would be inventing a number to satisfy a threshold, which is
 * the exact failure the threshold exists to prevent.
 */
function worthOf(id: ReportId, supplied: Supplied): number | undefined {
  if (!supplied.input) return undefined;
  if (id === "margin") return render(findAll(supplied.input)).recommended;
  return undefined;
}

/** How many reports this file can be sold as, for the bundle. */
export function sellableCount(supplied: Supplied): number {
  return offer(supplied).filter((o) => o.sellable).length;
}

/**
 * The offer as the sender reads it: the chapters of one report.
 *
 * There is one product and one price, so this is not a ticklist any more, it
 * is a table of contents. A chapter the file can carry is marked in; a
 * chapter it cannot says what to send, which is itself the reason to send it,
 * because adding a chapter later reissues the report for nothing.
 */
export function renderOffer(supplied: Supplied): string {
  const items = offer(supplied);
  const included = items.filter((o) => o.sellable || o.because?.includes("free")).length;

  const lines = items.map((o) => {
    if (o.sellable || o.because?.includes("free")) return `  [x] ${o.question}`;
    return `  [ ] ${o.question}   (${o.because})`;
  });

  const footer =
    included > 0
      ? `\nOne report, €9, containing every marked chapter. Send what the open lines ask for and we add those chapters and reissue it, at no charge.`
      : "\nNothing here can run yet, and nothing is charged.";

  return lines.join("\n") + "\n" + footer;
}

/** The questions report, so callers do not reach past the catalogue. */
export { questionsForYourAccountant };
