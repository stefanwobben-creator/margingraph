import { describe, test } from "vitest";
import assert from "node:assert/strict";

import { runwayReport } from "..";
import type { FindingsInput } from "@/lib/reports/findings/types";
import { allc } from "@/lib/reports/findings/__tests__/fixtures";

/**
 * The 2022 annual accounts of srprs.me, as the reader delivers them.
 *
 * This is the file the runway report was built against: real figures, and a
 * conclusion checked by a person who lived through the year. Cash in the bank
 * was €44,237 against roughly €41,000 of cash leaving per month — a runway of
 * about one month, which is what 2023 then was like. If the code stops
 * reproducing that, the code is wrong, not the year.
 */
const srprs: FindingsInput = {
  actual: {
    label: "2022",
    revenueKey: "netto-omzet",
    values: {
      "netto-omzet": 3_861_609,
      inkoopwaarde: 3_248_181,
      lonen: 215_498,
      "sociale-lasten": 51_806,
      afschrijvingen: 272_875,
      "overige-personeelsbeloningen": 173_864,
      huisvesting: 48_151,
      marketing: 405_120,
      kantoor: 6_408,
      algemeen: 206_102,
    },
  },
  contributionMargin: 613_428 / 3_861_609,
  costLines: [
    { key: "inkoopwaarde", label: "Inkoopwaarde van de omzet" },
    { key: "lonen", label: "Lonen en salarissen" },
    { key: "sociale-lasten", label: "Sociale lasten" },
    { key: "afschrijvingen", label: "Afschrijvingen" },
    { key: "overige-personeelsbeloningen", label: "Overige personeelsbeloningen" },
    { key: "huisvesting", label: "Huisvestingskosten" },
    { key: "marketing", label: "Verkoopkosten" },
    { key: "kantoor", label: "Kantoorkosten" },
    { key: "algemeen", label: "Algemene kosten" },
  ],
  tiers: [{ key: "inkoopwaarde", label: "Inkoopwaarde van de omzet", tier: 1 }],
};

describe("how long the money lasts", () => {
  test("reproduces the srprs.me 2022 runway: about one month", () => {
    const got = runwayReport(srprs, { cash: 44_237 })!;
    assert.ok(got, "the report should run on a full set of annual accounts");

    // Result −€766,396, of which €272,875 depreciation never left the bank.
    // Cash out €493,521 over twelve months.
    assert.equal(Math.round(got.monthlyBurn), 41_127);
    assert.ok(got.monthsLeft! > 1.0 && got.monthsLeft! < 1.2, `got ${got.monthsLeft}`);
    assert.match(got.text, /about 1\.1 months away at this pace/);
  });

  test("takes depreciation out of the burn, and shows the working", () => {
    const got = runwayReport(srprs, { cash: 44_237 })!;
    assert.match(got.text, /€272,875 is depreciation/);
    assert.match(got.text, /money that left the bank in an earlier year/);
  });

  test("a runway under six months says so in calendar terms", () => {
    const got = runwayReport(srprs, { cash: 44_237 })!;
    assert.match(got.text, /not a planning number, it is a calendar/);
  });

  test("names its own assumptions rather than wearing them silently", () => {
    const got = runwayReport(srprs, { cash: 44_237 })!;
    assert.match(got.text, /projected flat/);
    assert.match(got.text, /does not know your balance sheet/);
    assert.match(got.text, /We read 2022 as 12 months/);
  });

  test("a company that adds cash is told runway is not its question", () => {
    const got = runwayReport(allc, { cash: 100_000 })!;
    assert.ok(got.monthlyBurn <= 0, `burn was ${got.monthlyBurn}`);
    assert.equal(got.monthsLeft, undefined);
    assert.match(got.text, /Runway is not the question this file raises/);
    assert.match(got.text, /working capital/);
  });

  test("scales with the months the file covers", () => {
    const quarter = runwayReport(srprs, { cash: 44_237, months: 3 })!;
    // Same loss over a quarter of the time burns four times as fast:
    // €493,521 of cash movement over three months.
    assert.equal(Math.round(quarter.monthlyBurn), 164_507);
    assert.match(quarter.text, /as 3 months/);
  });

  test("refuses a file where the result cannot be rebuilt", () => {
    // No margin line and no cost of sales: this is a management report that
    // starts below gross margin without saying so. Turnover minus these costs
    // would read as wildly profitable, and a runway on that is a lie.
    const partial: FindingsInput = {
      actual: {
        label: "2026",
        revenueKey: "omzet",
        values: { omzet: 1_000_000, marketing: 50_000, it: 20_000 },
      },
      costLines: [
        { key: "marketing", label: "Marketing" },
        { key: "it", label: "Kosten IT" },
      ],
    };
    assert.equal(runwayReport(partial, { cash: 50_000 }), undefined);
  });

  test("runs without a margin line when the cost of sales is in the file", () => {
    const full: FindingsInput = {
      actual: {
        label: "2026",
        revenueKey: "omzet",
        values: { omzet: 1_200_000, inkoopwaarde: 700_000, personeel: 400_000, huur: 160_000 },
      },
      costLines: [
        { key: "inkoopwaarde", label: "Inkoopwaarde van de omzet" },
        { key: "personeel", label: "Personeelskosten" },
        { key: "huur", label: "Huur" },
      ],
    };
    const got = runwayReport(full, { cash: 30_000 })!;
    // Result −60,000 over twelve months: €5,000 a month, six months of cash.
    assert.equal(Math.round(got.monthlyBurn), 5_000);
    assert.ok(Math.abs(got.monthsLeft! - 6) < 0.01);
  });
});
