import { describe, test } from "vitest";
import assert from "node:assert/strict";

import { findAll, render } from "@/lib/reports/findings";
import { readSheet } from "..";
import type { Sheet } from "..";

const round = (n: number) => Math.round(n);

/**
 * The same company, one step earlier.
 *
 * `findings/__tests__/fixtures.ts` holds this company as the engine wants it:
 * keyed lines, signs already sorted, turnover already identified. This is what
 * actually arrived, and the test is that reading it produces the conclusion a
 * person reached by hand on the same file. A reader that runs without error but
 * reaches a different number is not a reader.
 */
const allcSheet: Sheet = {
  name: "V&W",
  rows: [
    [null, "trend 2026", "budget 2026", "verschil %"],
    ["Netto-omzet", 2_389_560, 2_850_000, -16.2],
    ["Kostprijs van de omzet", 1_510_202, 1_800_000, -16.1],
    ["Brutomarge", 879_358, 1_050_000, -16.3],
    ["Vracht uitgaand", 81_800, 111_200, -26.4],
    ["Doorberekende vracht", -45_400, -62_700, -27.6],
    ["Fulfilment", 101_000, 256_500, -60.6],
    ["Kosten IT", 82_700, 61_500, 34.5],
    ["Personeelskosten", 526_000, 600_000, -12.3],
    ["Marketing", 75_400, 112_800, -33.2],
  ],
};

describe("reading a profit and loss account", () => {
  const intake = readSheet(allcSheet);

  test("finds the two columns that are periods and ignores the one that is not", () => {
    assert.equal(intake.readable, true);
    assert.equal(intake.columns?.actual.header, "trend 2026");
    assert.equal(intake.columns?.reference?.header, "budget 2026");
    // The variance column carries numbers and means nothing.
    assert.notEqual(intake.columns?.actual.index, 3);
    assert.notEqual(intake.columns?.reference?.index, 3);
  });

  test("reads turnover, and not the cost line that has the word turnover in it", () => {
    assert.equal(intake.input?.actual.revenueKey, "netto-omzet");
    assert.equal(intake.input?.actual.values["netto-omzet"], 2_389_560);
    const cogs = intake.rows.find((r) => r.label.startsWith("Kostprijs"));
    assert.ok(cogs && cogs.kind !== "revenue", "cost of sales is not turnover");
  });

  test("leaves the subtotal out rather than counting it as a cost", () => {
    const margin = intake.rows.find((r) => r.label === "Brutomarge");
    assert.equal(margin?.kind, "margin");
    assert.ok(!("brutomarge" in (intake.input?.actual.values ?? {})));
  });

  test("takes the contribution margin off the gross margin line", () => {
    assert.equal(Number(intake.input?.contributionMargin?.toFixed(3)), 0.368);
  });

  test("pairs the freight that was billed on with the freight that was paid", () => {
    assert.deepEqual(intake.input?.recoveries, [
      { cost: "vracht-uitgaand", recovery: "doorberekende-vracht", label: "vracht uitgaand" },
    ]);
  });

  test("marks freight, fulfilment and cost of sales as following volume, and payroll as not", () => {
    const variable = intake.input?.variableLines?.map((l) => l.key);
    assert.deepEqual(variable, ["kostprijs-van-de-omzet", "vracht-uitgaand", "fulfilment"]);
    assert.ok(!variable?.includes("personeelskosten"));
  });

  test("says out loud which lines it could not place", () => {
    assert.ok(
      intake.notes.some((n) => n.includes("Marketing") && n.includes("Kosten IT")),
      "an unrecognised line has to be named, not silently treated as fixed",
    );
  });

  test("reaches the same conclusion a person reached by hand on this file", () => {
    const found = findAll(intake.input!);
    assert.deepEqual(
      found.map((f) => f.id),
      ["recovery-doorberekende-vracht", "overrun-kosten-it"],
    );
    assert.equal(round(found.reduce((s, f) => s + f.worth, 0)), 57_600);
    assert.equal(round(found[0].worth), 36_400);
  });

  test("prices the risk, because the margin came out of the same sheet", () => {
    const [freight] = findAll(intake.input!);
    assert.equal(round(freight.ladder![0].breakEvenRevenue!), 11_114);
    assert.match(freight.action, /less than 0\.5% of turnover in lost business/);
    assert.equal(freight.caveat, undefined);
  });

  test("produces a report worth more than the price of one", () => {
    const report = render(findAll(intake.input!));
    assert.equal(report.chargeable, true);
    assert.match(report.text, /^Found €57,600 of exposure\./);
  });
});

describe("a file that writes its costs as negatives", () => {
  const sheet: Sheet = {
    name: "Q1",
    rows: [
      ["", "Werkelijk Q1", "Begroot Q1"],
      ["Omzet", 414_400, 765_400],
      ["Husa Logistics", -27_400, -23_300],
      ["Husa pick", -23_500, -25_400],
      ["Husa assemblage", -26_000, -24_300],
      ["Vracht uitgaand", -40_300, -42_100],
      ["Doorberekende vracht", 25_400, 9_800],
      ["Personeelskosten", -149_500, -167_900],
      ["Kosten IT", -10_800, -5_400],
    ],
  };
  const intake = readSheet(sheet);

  test("reads a cost as an amount spent whichever way round the file writes it", () => {
    assert.equal(intake.readable, true);
    assert.equal(intake.input?.actual.values["husa-logistics"], 27_400);
    assert.equal(intake.input?.actual.values["vracht-uitgaand"], 40_300);
  });

  test("carries the recovery as a credit, whichever way round the file writes it", () => {
    assert.equal(intake.input?.actual.values["doorberekende-vracht"], -25_400);
  });

  test("collapses the contract lines into the one thing they say", () => {
    const found = findAll(intake.input!);
    assert.equal(found[0].id, "ratio-cost-base");
    assert.match(found[0].observation, /45\.9% below Begroot Q1/);
  });

  test("still finds the freight underneath it", () => {
    const freight = findAll(intake.input!).find((f) => f.id === "recovery-doorberekende-vracht");
    assert.equal(round(freight!.worth), 14_900);
  });

  test("does not test payroll for drift, so it cannot report wages that came in under budget", () => {
    const sources = findAll(intake.input!).flatMap((f) => f.source);
    assert.ok(!sources.includes("personeelskosten"));
  });
});

describe("what it refuses to guess at", () => {
  const withTwoBudgets: Sheet = {
    name: "P&L",
    rows: [
      [null, "Werkelijk", "Budget Q1", "Budget YTD"],
      ["Omzet", 100_000, 120_000, 480_000],
      ["Vracht", 10_000, 9_000, 36_000],
      ["Kosten IT", 5_000, 4_000, 16_000],
    ],
  };

  test("asks which comparison it should measure against", () => {
    const intake = readSheet(withTwoBudgets);
    assert.equal(intake.readable, false);
    assert.equal(intake.input, undefined);
    assert.match(intake.questions[0], /More than one column could be the comparison/);
    assert.match(intake.questions[0], /Budget Q1/);
  });

  test("takes the answer when it is given one", () => {
    const intake = readSheet(withTwoBudgets, { referenceColumn: 2 });
    assert.equal(intake.readable, true);
    assert.equal(intake.columns?.reference?.header, "Budget Q1");
  });

  test("asks which line is turnover rather than picking the biggest", () => {
    const intake = readSheet({
      name: "P&L",
      rows: [
        [null, "Werkelijk", "Budget"],
        ["Omzet webshop", 60_000, 70_000],
        ["Omzet groothandel", 40_000, 50_000],
        ["Vracht", 10_000, 9_000],
        ["Kosten IT", 5_000, 4_000],
      ],
    });
    assert.equal(intake.readable, false);
    assert.match(intake.questions[0], /Several lines could be turnover/);
  });

  test("takes the total when the file has one", () => {
    const intake = readSheet({
      name: "P&L",
      rows: [
        [null, "Werkelijk", "Budget"],
        ["Omzet webshop", 60_000, 70_000],
        ["Omzet groothandel", 40_000, 50_000],
        ["Totaal omzet", 100_000, 120_000],
        ["Vracht", 10_000, 9_000],
        ["Kosten IT", 5_000, 4_000],
      ],
    });
    assert.equal(intake.readable, true);
    assert.equal(intake.input?.actual.revenueKey, "totaal-omzet");
    assert.equal(intake.input?.actual.values["totaal-omzet"], 100_000);
    assert.ok(!("omzet-webshop" in intake.input!.actual.values));
  });

  test("says so when a file is nothing but percentages", () => {
    const intake = readSheet({
      name: "KPI",
      rows: [
        [null, "Verschil %", "Index"],
        ["Omzet", -16.2, 84],
        ["Vracht", -26.4, 74],
        ["Kosten IT", 34.5, 135],
      ],
    });
    assert.equal(intake.readable, false);
    assert.match(intake.questions[0], /variance or a percentage/);
  });

  test("warns when the statement is probably printed in thousands", () => {
    const intake = readSheet({
      name: "P&L",
      rows: [
        [null, "Werkelijk", "Budget"],
        ["Omzet", 2_389, 2_850],
        ["Vracht", 82, 111],
        ["Kosten IT", 83, 62],
      ],
    });
    assert.ok(intake.notes.some((n) => /printed in thousands/.test(n)));
  });

  test("multiplies through when it is told the scale", () => {
    const intake = readSheet(
      {
        name: "P&L",
        rows: [
          [null, "Werkelijk", "Budget"],
          ["Omzet", 2_389, 2_850],
          ["Vracht", 82, 111],
          ["Kosten IT", 83, 62],
        ],
      },
      { scale: 1000 },
    );
    assert.equal(intake.input?.actual.values["omzet"], 2_389_000);
  });
});
