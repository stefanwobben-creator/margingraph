import { describe, test } from "vitest";
import assert from "node:assert/strict";

import {
  MINIMUM_WORTH,
  budgetOverrun,
  findAll,
  ratioDrift,
  recoveryGap,
  render,
} from "..";
import { allc, am, clean } from "./fixtures";

const round = (n: number) => Math.round(n);

describe("recovery gap", () => {
  test("finds freight billed out at 55,5% of what it costs", () => {
    const [f] = recoveryGap(allc);
    assert.ok(f);
    assert.equal(round(f.worth), 36_400);
    assert.match(f.observation, /55,5%/);
    assert.deepEqual(f.source, ["vracht-uitgaand", "doorberekende-vracht"]);
  });

  test("says nothing when everything is billed on", () => {
    assert.deepEqual(recoveryGap(clean), []);
  });
});

describe("ratio drift", () => {
  test("leaves an ordinary overspend alone", () => {
    // IT at this company grew in euros and as a share of turnover, which is a
    // plain overrun. Their accounting package already says so.
    const ids = ratioDrift(allc).map((f) => f.id);
    assert.ok(!ids.includes("ratio-it"));
  });

  test("leaves a line that improved alone", () => {
    // Fulfilment went from 9,0% to 4,2% of turnover. That is the switch of
    // provider working, not a finding.
    const ids = ratioDrift(allc).map((f) => f.id);
    assert.ok(!ids.includes("ratio-fulfilment"));
  });

  test("collapses five contract lines into the one thing they say", () => {
    const found = ratioDrift(am);
    assert.equal(found.length, 1, "five separate findings would be padding");
    const [f] = found;
    assert.equal(f.id, "ratio-cost-base");
    assert.equal(round(f.worth), 66_076);
    assert.match(f.observation, /45,9% onder budget Q1/);
    assert.match(f.observation, /5 van je 5/);
  });

  test("carries the caveat that part of the cost is fixed", () => {
    const [f] = ratioDrift(am);
    assert.ok(f.caveat);
    assert.match(f.caveat, /omvang van het gesprek/);
  });

  test("never runs over payroll, so it cannot report wages that came in under budget", () => {
    // Payroll is not in variableLines by construction. Q1 wages were 36,1% of
    // turnover against 21,9% budgeted, which would have produced a confident
    // finding of about €58.600 on a line that was €18.400 underspent.
    const sources = ratioDrift(am).flatMap((f) => f.source);
    assert.ok(!sources.includes("personeel"));
  });
});

describe("budget overrun", () => {
  test("catches IT running over", () => {
    const it = budgetOverrun(allc).find((f) => f.id === "overrun-it");
    assert.ok(it);
    assert.equal(round(it.worth), 21_200);
  });

  test("ignores anything under the price of ten reports", () => {
    assert.deepEqual(budgetOverrun(clean), []);
  });
});

describe("the whole set, on a real company", () => {
  const found = findAll(allc);

  test("returns two findings, biggest first", () => {
    assert.deepEqual(
      found.map((f) => f.id),
      ["recovery-doorberekende-vracht", "overrun-it"],
    );
  });

  test("adds up to what a person found by hand", () => {
    assert.equal(round(found.reduce((s, f) => s + f.worth, 0)), 57_600);
  });

  test("does not report the same money twice", () => {
    // Fulfilment is in both variableLines and costLines. It improved, so
    // neither rule fires, but the deduplication is what stops a line that does
    // fire from appearing as both a drift and an overrun.
    const ids = found.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("the whole set, on the second company", () => {
  const found = findAll(am);

  test("leads with the cost base, not the freight", () => {
    assert.equal(found[0].id, "ratio-cost-base");
  });

  test("still reports the freight recovery underneath it", () => {
    const freight = found.find((f) => f.id === "recovery-doorberekende-vracht");
    assert.ok(freight);
    assert.equal(round(freight.worth), 14_900);
  });

  test("drops the overruns the cost-base finding already covers", () => {
    const ids = found.map((f) => f.id);
    assert.ok(!ids.includes("overrun-husa-logistics"));
  });
});

describe("the report", () => {
  test("puts found against paid at the top", () => {
    const report = render(findAll(allc));
    assert.ok(report.chargeable);
    assert.match(report.text, /^Gevonden €57\.600\. Betaald €9\./);
  });

  test("gives four lines per finding and no chapters", () => {
    const report = render(findAll(allc));
    assert.match(report.text, /Waard: /);
    // Never "per jaar" on a figure that is not annual.
    assert.ok(!/per jaar/.test(report.text));
    assert.match(report.text, /Doen: /);
    assert.match(report.text, /Check: /);
    assert.ok(!/confidence|hoofdstuk|methode/i.test(report.text));
  });

  test("refuses to charge when it found less than ten times the price", () => {
    const report = render([
      {
        id: "x",
        per: "2026",
        observation: "Iets kleins.",
        worth: 40,
        action: "Doen.",
        workings: "40.",
        source: [],
      },
    ]);
    assert.equal(report.chargeable, false);
    assert.match(report.text, /te weinig, dus dit rapport is gratis/);
    assert.ok(report.found < MINIMUM_WORTH);
  });

  test("says nothing found rather than inventing something", () => {
    const report = render(findAll(clean));
    assert.equal(report.found, 0);
    assert.equal(report.chargeable, false);
    assert.equal(report.shareable, undefined);
  });

  test("offers one line the owner can forward without their figures in it", () => {
    const report = render(findAll(allc));
    assert.ok(report.shareable);
    assert.match(report.shareable, /€36\.400/);
    assert.ok(!report.shareable.includes("2.389.560"));
  });
});
