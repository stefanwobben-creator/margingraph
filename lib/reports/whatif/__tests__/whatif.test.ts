import { describe, test } from "vitest";
import assert from "node:assert/strict";

import { buildModel, pricingReport, shockReport } from "..";
import { allc, clean } from "@/lib/reports/findings/__tests__/fixtures";

const round = (n: number) => Math.round(n);

describe("the model both reports stand on", () => {
  const model = buildModel(allc)!;

  test("reads gross profit off the file's own margin line", () => {
    // 36.8% of €2,389,560. The margin embeds cost of sales, which is why the
    // model can be honest even when the file never itemised buying.
    assert.equal(round(model.gross), 879_358);
  });

  test("nets what is billed back to customers off the flexible pile", () => {
    // Fulfilment + freight + marketing = €258,200, minus €45,400 recovered.
    // Recovered freight is volume income sitting on the cost side, and
    // counting it as fixed would punish the company for invoicing properly.
    assert.equal(round(model.flex), 212_800);
  });

  test("keeps the cost of existing out of the volume arithmetic", () => {
    assert.equal(round(model.fixed), 608_700);
    assert.equal(round(model.leftover), 57_858);
  });

  test("refuses to run without a margin line rather than guessing one", () => {
    assert.equal(buildModel({ ...allc, contributionMargin: undefined }), undefined);
    assert.equal(buildModel({ ...allc, tiers: [] }), undefined);
  });
});

describe("what a 20% drop would do", () => {
  const report = shockReport(allc)!;

  test("shows that a 20% drop takes far more than 20% of the result", () => {
    assert.equal(round(report.now), 57_858);
    assert.equal(round(report.after), -75_454);
    assert.match(report.text, /takes all of it and then some/);
  });

  test("names the cushion, which is the number worth knowing in advance", () => {
    // Turnover can fall 8.7% before nothing is left. The owner's guess for
    // this company would have been 20-something, because the leftover is
    // positive and the drop feels survivable.
    assert.ok(Math.abs(report.absorb - 0.0868) < 0.001);
    assert.match(report.text, /turnover can fall 8\.7% before nothing is left/);
  });

  test("prints its own workings, like every other report here", () => {
    assert.match(report.text, /Check: gross profit €879,358/);
  });

  test("stays quiet about sticky contracts when none misbehaved", () => {
    // Fulfilment improved at this company, so the drift rule fired nothing
    // and warning about it anyway would be reflexive hedging.
    assert.ok(!report.text.includes("did not follow your volume down"));
  });
});

describe("what a price rise can cost", () => {
  const report = pricingReport(allc)!;

  test("prices the three standard steps against their margin", () => {
    // At m = 0.368: 2% breaks even at 5.2% volume lost, 5% at 12.0%, 10% at 21.4%.
    const losses = report.steps.map((s) => Number((s.breakEvenLoss * 100).toFixed(1)));
    assert.deepEqual(losses, [5.2, 12.0, 21.4]);
  });

  test("states what each rise is worth when nobody walks", () => {
    assert.equal(round(report.steps[1].worth), 119_478);
    assert.match(report.text, /worth  €119,478/);
  });

  test("runs the formula backwards, because discounting is the expensive half", () => {
    // A 5% discount at a 36.8% margin needs 15.7% more volume to stand still.
    assert.ok(Math.abs(report.cut.neededGain - 0.157) < 0.001);
    assert.match(report.text, /discount needs 15\.7% more volume just to stand still/);
  });

  test("refuses a margin it cannot believe", () => {
    assert.equal(pricingReport({ ...allc, contributionMargin: undefined }), undefined);
    assert.equal(pricingReport({ ...allc, contributionMargin: 1.2 }), undefined);
  });
});

describe("on a file with nothing wrong", () => {
  test("the what-ifs still run, because they are not findings", () => {
    // A clean file has no leak to report, but "what would a bad quarter do"
    // is a question about the future, and a clean past does not answer it.
    const report = pricingReport({ ...clean, contributionMargin: 0.4 });
    assert.ok(report);
    assert.match(report!.text, /You keep 40 cents of every extra euro/);
  });
});
