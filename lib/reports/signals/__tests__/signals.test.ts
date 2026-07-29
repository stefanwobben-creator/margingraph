import { describe, test } from "vitest";
import assert from "node:assert/strict";

import { signalsReport, whySignalsBlocked } from "..";
import type { FindingsInput } from "@/lib/reports/findings/types";
import { allc } from "@/lib/reports/findings/__tests__/fixtures";

/**
 * A goods trader in the shape of srprs.me 2022: turnover up hard, everything
 * underneath it weaker. The year the signals exist for — growth that reads as
 * success from inside and as an alarm from one table.
 */
const grewWeaker: FindingsInput = {
  actual: {
    label: "2022",
    revenueKey: "omzet",
    values: {
      omzet: 3_861_609,
      inkoopwaarde: 3_248_181,
      lonen: 215_498,
      "sociale-lasten": 51_806,
      marketing: 405_120,
      huisvesting: 48_151,
      algemeen: 206_102,
    },
  },
  reference: {
    label: "2021",
    revenueKey: "omzet",
    values: {
      omzet: 2_987_843,
      inkoopwaarde: 2_188_180,
      lonen: 200_000,
      "sociale-lasten": 45_000,
      marketing: 229_229,
      huisvesting: 45_000,
      algemeen: 180_000,
    },
  },
  costLines: [
    { key: "inkoopwaarde", label: "Inkoopwaarde van de omzet" },
    { key: "lonen", label: "Lonen en salarissen" },
    { key: "sociale-lasten", label: "Sociale lasten" },
    { key: "marketing", label: "Verkoopkosten" },
    { key: "huisvesting", label: "Huisvestingskosten" },
    { key: "algemeen", label: "Algemene kosten" },
  ],
  tiers: [
    { key: "inkoopwaarde", label: "Inkoopwaarde van de omzet", tier: 1 },
    { key: "marketing", label: "Verkoopkosten", tier: 3 },
    { key: "lonen", label: "Lonen en salarissen", tier: 4 },
    { key: "sociale-lasten", label: "Sociale lasten", tier: 4 },
    { key: "huisvesting", label: "Huisvestingskosten", tier: 4 },
    { key: "algemeen", label: "Algemene kosten", tier: 4 },
  ],
  labourLines: [
    { key: "lonen", label: "Lonen en salarissen" },
    { key: "sociale-lasten", label: "Sociale lasten" },
  ],
};

describe("the health signals a profit and loss can carry", () => {
  const report = signalsReport(grewWeaker)!;

  test("scores a growth year that got weaker as exactly that", () => {
    assert.ok(report);
    // Turnover up; margin, labour productivity, result and overhead
    // discipline all down. Growth is the only signal pointing up, which is
    // the whole story of a year like this.
    assert.equal(report.signals.length, 5);
    assert.equal(report.score, 1);
    const up = report.signals.filter((s) => s.stronger).map((s) => s.id);
    assert.deepEqual(up, ["turnover"]);
    assert.match(report.text, /1 of 5 signals say stronger/);
    assert.match(report.text, /More signals point down than up/);
  });

  test("every verdict carries the two figures behind it", () => {
    for (const s of report.signals) {
      // "€X against €Y", or for the discipline signal, both growth rates.
      assert.match(s.detail, /against|,/, `${s.id} has no comparison in it`);
      assert.ok(/\d/.test(s.detail), `${s.id} has no figure in it`);
    }
    const margin = report.signals.find((s) => s.id === "margin")!;
    assert.equal(margin.detail, "16 cents against 27");
  });

  test("says out loud which signals the balance sheet would add", () => {
    assert.match(report.text, /we do not score what we cannot see/);
    assert.match(report.text, /balance sheet/);
    assert.match(report.text, /out of nine/);
  });

  test("refuses to score direction against a budget", () => {
    // allc compares against "budget 2026". Beating a plan is not direction.
    assert.equal(signalsReport(allc), undefined);
    assert.match(whySignalsBlocked(allc)!, /beating a plan is not the same as getting stronger/);
  });

  test("refuses a single year, because one point has no direction", () => {
    const alone = { ...grewWeaker, reference: undefined };
    assert.match(whySignalsBlocked(alone)!, /one year on its own has no direction/);
  });

  test("refuses when too few lines carry both years", () => {
    const sparse: FindingsInput = {
      actual: { label: "2025", revenueKey: "omzet", values: { omzet: 900_000 } },
      reference: { label: "2024", revenueKey: "omzet", values: { omzet: 800_000 } },
    };
    assert.match(whySignalsBlocked(sparse)!, /too few lines carry both years/);
  });

  test("gate and report can never disagree", () => {
    assert.equal(whySignalsBlocked(grewWeaker), undefined);
    assert.ok(signalsReport(grewWeaker));
  });
});
