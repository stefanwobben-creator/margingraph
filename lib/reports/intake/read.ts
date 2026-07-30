import type { FindingsInput } from "@/lib/reports/findings";

import type { Cell, ClassifiedRow, Intake, RowKind, Sheet } from "./types";
import {
  ACTUAL_HEADER,
  DERIVED_HEADER,
  GROSS_MARGIN,
  NEVER_VARIABLE,
  NET_REVENUE,
  NOT_OPERATING,
  NOT_REVENUE,
  OTHER_INCOME,
  REVENUE_DEDUCTION,
  RECOVERY,
  REFERENCE_HEADER,
  REVENUE,
  SCENARIO,
  SUBTOTAL,
  VARIABLE,
  has,
  normalise,
  isLabour,
  spanOf,
  tierOf,
} from "./vocabulary";

export type ReadOptions = {
  /** Override the column detection when the file is too ambiguous to decide. */
  actualColumn?: number;
  referenceColumn?: number;
  /** Multiply every amount. Use 1000 for a statement printed in thousands. */
  scale?: number;
};

const isNumber = (c: Cell): c is number => typeof c === "number" && Number.isFinite(c);
const isText = (c: Cell): c is string => typeof c === "string" && c.trim() !== "";

const slug = (label: string) =>
  normalise(label).replace(/\s+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "line";

/**
 * Read a profit and loss account into the lines the engine works on.
 *
 * This was the last manual step. Everything downstream of it, the gate, the
 * rules, the report, has been deterministic from the start, while a person sat
 * at the front deciding which column was the budget and which line was
 * turnover. That person was the bottleneck and, worse, the part of the product
 * that could not be tested.
 *
 * The rule it is built on is the same one the gate is built on: refuse rather
 * than guess. Every decision it does make comes back in `rows` and `notes` so
 * it can be checked; every decision it will not make comes back in `questions`
 * as something a human can answer in one line.
 */
export function readSheet(sheet: Sheet, options: ReadOptions = {}): Intake {
  const questions: string[] = [];
  const notes: string[] = [];
  const rows: ClassifiedRow[] = [];
  const scale = options.scale ?? 1;

  const width = Math.max(0, ...sheet.rows.map((r) => r.length));
  if (width === 0 || sheet.rows.length === 0) {
    return { readable: false, questions: ["The sheet is empty."], notes, rows };
  }

  // The label column is wherever the words are. In practice always the first,
  // but files exported from an accounting package sometimes carry a code
  // column in front of it.
  const textCount = new Array<number>(width).fill(0);
  const numCount = new Array<number>(width).fill(0);
  for (const row of sheet.rows) {
    for (let c = 0; c < width; c += 1) {
      if (isText(row[c])) textCount[c] += 1;
      else if (isNumber(row[c])) numCount[c] += 1;
    }
  }
  const labelColumn = textCount.indexOf(Math.max(...textCount));
  const numericColumns = Array.from({ length: width }, (_, c) => c).filter(
    (c) => c !== labelColumn && numCount[c] >= 3,
  );

  if (numericColumns.length === 0) {
    return {
      readable: false,
      questions: ["No column holds enough numbers to be a set of figures."],
      notes,
      rows,
    };
  }

  const firstDataRow = sheet.rows.findIndex(
    (row) => isText(row[labelColumn]) && numericColumns.some((c) => isNumber(row[c])),
  );
  if (firstDataRow < 0) {
    return {
      readable: false,
      questions: ["No row pairs a label with a figure."],
      notes,
      rows,
    };
  }

  // Headers are stacked as often as not: a year on one row, "budget" on the
  // next. Everything above the first data row, joined, is the column's name.
  const headerOf = (c: number) =>
    sheet.rows
      .slice(0, firstDataRow)
      .map((row) => row[c])
      .filter(isText)
      .map((s) => s.trim())
      .join(" ")
      .trim();

  const headers = new Map(numericColumns.map((c) => [c, headerOf(c)]));
  const usable = numericColumns.filter((c) => !has(headers.get(c) ?? "", DERIVED_HEADER));

  if (usable.length === 0) {
    return {
      readable: false,
      questions: [
        "Every numeric column looks like a variance or a percentage. Send the columns with the amounts in them.",
      ],
      notes,
      rows,
    };
  }

  // Reference column first: "budget" is the least ambiguous word on the sheet.
  let referenceColumn = options.referenceColumn;
  if (referenceColumn === undefined) {
    const refs = usable.filter((c) => has(headers.get(c) ?? "", REFERENCE_HEADER));
    if (refs.length === 1) referenceColumn = refs[0];
    else if (refs.length > 1) {
      questions.push(
        `More than one column could be the comparison: ${refs
          .map((c) => `column ${c + 1} "${headers.get(c) || "unnamed"}"`)
          .join(", ")}. Which one should we measure against?`,
      );
    }
  }

  let actualColumn = options.actualColumn;
  if (actualColumn === undefined) {
    // Any column calling itself a budget is out, not just the one we picked.
    // "Budget YTD" says year to date, which is also how an actuals column
    // announces itself, and the word budget is the one that settles it.
    const rest = usable.filter(
      (c) => c !== referenceColumn && !has(headers.get(c) ?? "", REFERENCE_HEADER),
    );
    const named = rest.filter((c) => has(headers.get(c) ?? "", ACTUAL_HEADER));
    const candidates = named.length > 0 ? named : rest;
    if (candidates.length === 1) actualColumn = candidates[0];
    else if (candidates.length > 1) {
      // Columns headed by nothing but years: the printed shape of a set of
      // annual accounts, where this year stands beside last year. The later
      // year is the period that happened and the earlier one the comparison.
      // That is not a guess about the file, it is how statements are printed;
      // a budget column would say budget, and then this path never runs.
      const yearOf = (c: number) => {
        const m = (headers.get(c) ?? "").trim().match(/^(19|20)\d{2}$/);
        return m ? Number(m[0]) : undefined;
      };
      const years = candidates.map(yearOf);
      if (years.every((y) => y !== undefined) && new Set(years).size === years.length) {
        const ordered = [...candidates].sort((a, b) => yearOf(b)! - yearOf(a)!);
        actualColumn = ordered[0];
        if (referenceColumn === undefined && ordered.length > 1) {
          referenceColumn = ordered[1];
          notes.push(
            `The columns are headed by years, so we read ${yearOf(ordered[0])} as the period ` +
              `that happened and ${yearOf(ordered[1])} as the comparison.`,
          );
        }
      } else {
        questions.push(
          `More than one column could be the period that happened: ${candidates
            .map((c) => `column ${c + 1} "${headers.get(c) || "unnamed"}"`)
            .join(", ")}. Which one is it?`,
        );
      }
    }
  }

  if (actualColumn === undefined) {
    if (questions.length === 0) questions.push("No column holds the figures for the period.");
    return { readable: false, questions, notes, rows };
  }
  if (referenceColumn === undefined && questions.length === 0) {
    notes.push(
      "No budget or prior-year column found, so only the rules that read one period can run.",
    );
  }

  // Same arithmetic, different amounts of time. Both columns can be perfectly
  // correct and comparing them still produces a page of confident nonsense.
  if (referenceColumn !== undefined) {
    const here = spanOf(headers.get(actualColumn) ?? "");
    const there = spanOf(headers.get(referenceColumn) ?? "");
    if (here && there && here.id !== there.id) {
      questions.push(
        `Column ${actualColumn + 1} covers ${here.label} and column ${referenceColumn + 1} covers ${there.label}. ` +
          `Comparing them would make every ratio in the report wrong. Point us at two columns that cover the same stretch of time.`,
      );
      return { readable: false, questions, notes, rows };
    }
  }

  const actualLabel = headers.get(actualColumn) || sheet.name || "this period";
  const referenceLabel =
    referenceColumn === undefined ? undefined : headers.get(referenceColumn) || "comparison";

  // --- rows -------------------------------------------------------------

  const used = new Set<string>();
  const keyFor = (label: string) => {
    const base = slug(label);
    let key = base;
    let n = 2;
    while (used.has(key)) key = `${base}-${n++}`;
    used.add(key);
    return key;
  };

  for (let r = firstDataRow; r < sheet.rows.length; r += 1) {
    const row = sheet.rows[r];
    const label = isText(row[labelColumn]) ? (row[labelColumn] as string).trim() : "";
    const rawActual = isNumber(row[actualColumn]) ? (row[actualColumn] as number) : null;
    const rawReference =
      referenceColumn !== undefined && isNumber(row[referenceColumn])
        ? (row[referenceColumn] as number)
        : null;

    if (!label) continue;
    if (rawActual === null && rawReference === null) continue;

    const kind = classify(label);
    const entry: ClassifiedRow = {
      row: r,
      label,
      key: kind === "skip" ? slug(label) : keyFor(label),
      kind,
      actual: rawActual === null ? null : rawActual * scale,
      reference: rawReference === null ? null : rawReference * scale,
    };
    if (kind === "subtotal") entry.because = "restates the lines above it";
    if (kind === "margin") entry.because = "used for the margin, not counted as a cost";
    if (kind === "skip") {
      entry.because = has(label, SCENARIO)
        ? "a forecast or scenario, not an amount that happened"
        : has(label, REVENUE_DEDUCTION)
          ? "already deducted inside net turnover"
          : has(label, OTHER_INCOME)
            ? "income, not a cost, and not turnover; left out of the ratios"
            : "below the operating line";
    }
    rows.push(entry);
  }

  // --- is this a profit and loss account at all? -------------------------
  //
  // A forecast workbook read as a P&L produces confident nonsense: scenarios
  // become costs, and any line with a revenue word in it becomes turnover.
  // The tell is recognition. On a real P&L the vocabulary places most lines:
  // freight, payroll, rent, a margin subtotal. On a forecast it places none.
  // No recognised line means we are holding the wrong kind of document, and
  // the honest move is to say so rather than to sell a report about it.
  const recognised = rows.filter(
    (row) =>
      row.kind === "margin" ||
      row.kind === "recovery" ||
      row.kind === "variable" ||
      (row.kind === "cost" && (has(row.label, NEVER_VARIABLE) || has(row.label, VARIABLE))),
  ).length;

  if (recognised === 0) {
    const others = (sheet.sheets ?? []).filter((name) => name !== sheet.name);
    questions.push(
      `Nothing on the tab "${sheet.name}" looks like a profit and loss line to us: no cost ` +
        `of sales, no payroll, no freight, no margin subtotal. It reads like a forecast or ` +
        `working sheet.` +
        (others.length > 0
          ? ` This workbook also has: ${others.map((name) => `"${name}"`).join(", ")}. ` +
            `If the profit and loss account is on one of those, tell us which.`
          : ` If the figures live in a different file, send that one.`),
    );
    return { readable: false, questions, notes, rows };
  }

  // --- turnover ---------------------------------------------------------

  const revenueRows = rows.filter((row) => row.kind === "revenue" && row.actual !== null);
  const revenueTotals = revenueRows.filter((row) => has(row.label, SUBTOTAL));
  let revenue = revenueTotals.length === 1 ? revenueTotals[0] : undefined;
  if (!revenue && revenueRows.length === 1) revenue = revenueRows[0];

  // Invoiced turnover and net turnover are both called turnover, and only the
  // one after discounts and credit notes belongs underneath a ratio. Taking
  // the gross line would flatter every percentage in the report by exactly the
  // discount rate, which is the kind of error nobody notices and everybody
  // acts on.
  if (!revenue) {
    const net = revenueRows.filter((row) => has(row.label, NET_REVENUE));
    if (net.length === 1) {
      revenue = net[0];
      notes.push(
        `Two lines here name turnover. We used "${revenue.label}" rather than ${revenueRows
          .filter((row) => row !== revenue)
          .map((row) => `"${row.label}"`)
          .join(", ")}, because a ratio belongs under turnover after discounts.`,
      );
    }
  }

  if (!revenue) {
    questions.push(
      revenueRows.length === 0
        ? "No line in this file names turnover. Which row is it?"
        : `Several lines could be turnover: ${revenueRows
            .map((row) => `"${row.label}"`)
            .join(", ")}. Which one is the total, or should we add them up?`,
    );
    return { readable: false, questions, notes, rows };
  }
  for (const row of revenueRows) {
    if (row === revenue) continue;
    row.kind = "skip";
    row.because = `counted inside "${revenue.label}"`;
  }

  // --- recoveries -------------------------------------------------------

  const recoveries: NonNullable<FindingsInput["recoveries"]> = [];
  for (const credit of rows.filter((row) => row.kind === "recovery")) {
    const stem = normalise(credit.label)
      .split(" ")
      .filter((t) => t.length >= 4 && !has(t, RECOVERY));
    const match = rows
      .filter((row) => row.kind === "variable" || row.kind === "cost")
      .map((row) => ({
        row,
        overlap: stem.filter((t) => normalise(row.label).split(" ").some((u) => u.startsWith(t)))
          .length,
      }))
      .filter((m) => m.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)[0];

    if (!match) {
      credit.kind = "skip";
      credit.because = "billed back to customers, but we could not find the cost it belongs to";
      notes.push(
        `"${credit.label}" looks like a cost billed back to customers, but no matching cost line was found, so it was left out.`,
      );
      continue;
    }
    // The cost side has to stay volume-variable: a freight bill that does not
    // follow turnover is the other half of the same conversation.
    if (match.row.kind === "cost") match.row.kind = "variable";
    recoveries.push({
      cost: match.row.key,
      recovery: credit.key,
      // The cost line's own label, because the finding will tell the owner to
      // go and look at it. A stem like "vracht" reads like a category; the
      // words in their own file read like an instruction.
      label: match.row.label.toLowerCase(),
    });
  }

  // --- signs ------------------------------------------------------------

  // A supplier's name says nothing about whether their invoice follows your
  // turnover. Unrecognised lines are treated as fixed, which is the safe error:
  // the drift rule is the one that would otherwise announce that wages are too
  // high in a quarter where wages came in under budget.
  const unrecognised = rows.filter(
    (row) => row.kind === "cost" && !has(row.label, NEVER_VARIABLE) && !has(row.label, VARIABLE),
  );
  for (const row of unrecognised) row.because = "no word we recognise, so treated as fixed";
  if (unrecognised.length > 0) {
    notes.push(
      `We could not tell whether these move with your turnover, so we treated them as fixed: ${unrecognised
        .map((row) => `"${row.label}"`)
        .join(", ")}. Say which of them are, and there may be more in the file than we found.`,
    );
  }

  const costRows = rows.filter((row) => row.kind === "variable" || row.kind === "cost");
  const negatives = costRows.filter((row) => (row.actual ?? 0) < 0).length;
  if (negatives > 0 && negatives < costRows.length) {
    const odd = costRows.filter((row) =>
      negatives > costRows.length / 2 ? (row.actual ?? 0) > 0 : (row.actual ?? 0) < 0,
    );
    notes.push(
      `Costs in this file are mostly ${negatives > costRows.length / 2 ? "negative" : "positive"}, except ${odd
        .map((row) => `"${row.label}"`)
        .join(", ")}. We read every cost as an amount spent; if one of those is a credit, tell us.`,
    );
  }

  // --- the input the engine reads ---------------------------------------

  const values = (which: "actual" | "reference") => {
    const out: Record<string, number> = {};
    for (const row of rows) {
      const raw = row[which];
      if (raw === null) continue;
      if (row.kind === "revenue") out[row.key] = Math.abs(raw);
      else if (row.kind === "recovery") out[row.key] = -Math.abs(raw);
      else if (row.kind === "variable" || row.kind === "cost") out[row.key] = Math.abs(raw);
    }
    return out;
  };

  const actualValues = values("actual");
  const marginRow = rows.find((row) => row.kind === "margin" && row.actual !== null);
  const grossMargin = marginRow
    ? Math.abs(marginRow.actual as number) / actualValues[revenue.key]
    : undefined;
  const contributionMargin =
    grossMargin !== undefined && grossMargin > 0 && grossMargin < 1 ? grossMargin : undefined;
  if (marginRow && contributionMargin === undefined) {
    notes.push(
      `"${marginRow.label}" did not give a usable margin against turnover, so we could not price what a change can safely cost.`,
    );
  }

  const lines = (kinds: RowKind[]) =>
    rows
      .filter((row) => kinds.includes(row.kind) && row.actual !== null)
      .map((row) => ({ key: row.key, label: row.label }));

  // Only lines we can actually place. A cost we cannot read into a step is
  // left out of the cascade rather than dropped into the nearest one, because
  // the whole value of the cascade is that it names which step, and a step
  // padded with unplaceable lines names nothing.
  const tiers = rows
    .filter((row) => (row.kind === "variable" || row.kind === "cost") && row.actual !== null)
    .map((row) => ({ key: row.key, label: row.label, tier: tierOf(row.label) }))
    .filter((line): line is { key: string; label: string; tier: 1 | 2 | 3 | 4 } =>
      line.tier !== undefined,
    );

  const labourLines = rows
    .filter((row) => row.kind === "cost" && row.actual !== null && isLabour(row.label))
    .map((row) => ({ key: row.key, label: row.label }));

  const input: FindingsInput = {
    actual: { label: actualLabel, revenueKey: revenue.key, values: actualValues },
    reference:
      referenceColumn === undefined
        ? undefined
        : {
            label: referenceLabel ?? "comparison",
            revenueKey: revenue.key,
            values: values("reference"),
          },
    recoveries,
    variableLines: lines(["variable"]),
    costLines: lines(["variable", "cost"]),
    tiers,
    labourLines,
    contributionMargin,
  };

  if (!actualValues[revenue.key]) {
    questions.push(`"${revenue.label}" has no figure in ${actualLabel}, so nothing can be a ratio.`);
    return { readable: false, questions, notes, rows };
  }

  if (actualValues[revenue.key] < 20_000) {
    notes.push(
      `Turnover reads as ${Math.round(actualValues[revenue.key]).toLocaleString("en-GB")}. If this statement is printed in thousands, every amount in the report is too, and the file should be read again with a scale of 1000.`,
    );
  }

  return {
    readable: questions.length === 0,
    input: questions.length === 0 ? input : undefined,
    questions,
    notes,
    rows,
    columns: {
      label: labelColumn,
      actual: { index: actualColumn, header: actualLabel },
      reference:
        referenceColumn === undefined
          ? undefined
          : { index: referenceColumn, header: referenceLabel ?? "comparison" },
    },
  };
}

/**
 * One row, one kind.
 *
 * The order is the whole rule. Cost of sales is checked before turnover
 * because it contains the word turnover; the never-variable list is checked
 * before the variable one because "personeelskosten magazijn" contains the
 * word warehouse and payroll does not follow a bad quarter down.
 */
function classify(label: string): RowKind {
  if (has(label, SCENARIO)) return "skip";
  if (has(label, GROSS_MARGIN)) return "margin";
  if (has(label, RECOVERY)) return "recovery";
  if (has(label, REVENUE_DEDUCTION) || has(label, NOT_OPERATING) || has(label, OTHER_INCOME))
    return "skip";
  if (has(label, SUBTOTAL)) {
    return has(label, REVENUE) && !has(label, NOT_REVENUE) ? "revenue" : "subtotal";
  }
  if (has(label, REVENUE) && !has(label, NOT_REVENUE)) return "revenue";
  if (has(label, NEVER_VARIABLE)) return "cost";
  if (has(label, VARIABLE)) return "variable";
  return "cost";
}
