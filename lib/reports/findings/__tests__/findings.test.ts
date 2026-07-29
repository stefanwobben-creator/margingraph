import { describe, test } from "vitest";
import assert from "node:assert/strict";

import {
  MINIMUM_WORTH,
  teaser,
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
    assert.match(f.observation, /55\.5%/);
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
    assert.match(f.observation, /45\.9% below budget Q1/);
    assert.match(f.observation, /5 of your 5/);
  });

  test("carries the caveat that part of the cost is fixed", () => {
    const [f] = ratioDrift(am);
    assert.ok(f.caveat);
    assert.match(f.caveat, /size of the conversation/);
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
  test("leads with what we would actually recommend, not with the ceiling", () => {
    // The freight finding's ceiling is €36,400 and the step we advise is
    // €4,090. A headline of €57,600 followed by advice worth a fourteenth of
    // it teaches the most engaged reader that our numbers are inflated.
    const report = render(findAll(allc));
    assert.ok(report.chargeable);
    assert.equal(round(report.found), 57_600);
    assert.equal(round(report.recommended), 25_290);
    assert.match(report.text, /^Found €57,600 of exposure\./);
    assert.match(report.text, /actually recommend inside it are worth €25,290\. Paid €9\./);
  });

  test("gives four lines per finding and no chapters", () => {
    const report = render(findAll(allc));
    assert.match(report.text, /Worth:  /);
    // Never "per year" on a figure that is not annual.
    assert.ok(!/per year/.test(report.text));
    assert.match(report.text, /Do:     /);
    assert.match(report.text, /Check:  /);
    assert.ok(!/confidence|chapter|method/i.test(report.text));
  });

  test("refuses to charge when it found less than ten times the price", () => {
    const report = render([
      {
        id: "x",
        per: "2026",
        subject: "Something",
        observation: "Iets kleins.",
        worth: 40,
        action: "Doen.",
        workings: "40.",
        source: [],
      },
    ]);
    assert.equal(report.chargeable, false);
    assert.match(report.text, /under our minimum, so this report is free/);
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
    assert.match(report.shareable, /€36,400/);
    assert.ok(!report.shareable.includes("2,389,560"));
  });
});

describe("the teaser, which is the guarantee made mechanical", () => {
  const t = teaser(findAll(allc));

  test("shows both totals and the count before anything is paid", () => {
    assert.equal(round(t.found), 57_600);
    assert.equal(round(t.recommended), 25_290);
    assert.equal(t.count, 2);
    assert.match(t.text, /found €57,600 of exposure across 2 findings/);
    assert.match(t.text, /actually recommend inside that are worth €25,290/);
  });

  test("keeps the answer back: no source line, no arithmetic, no action", () => {
    // These are the three things €9 buys. An earlier version handed the
    // largest finding over whole and had nothing left to sell.
    assert.ok(!t.text.includes("€81,800"), "the source figures are visible");
    assert.ok(!/Check:/.test(t.text), "the arithmetic is visible");
    assert.ok(!/Do:/.test(t.text), "the action is visible");
    assert.ok(!/vracht-uitgaand/.test(t.text), "the line it sits on is named");
  });

  test("names every subject and prices every one of them", () => {
    assert.equal(t.locked.length, 2);
    assert.deepEqual(t.locked, [
      "How much of your uitgaande vracht you recover from customers",
      "Kosten IT against budget",
    ]);
    assert.match(t.text, /€36,400/);
    assert.match(t.text, /€21,200/);
  });

  test("is unlockable, because there is something to sell", () => {
    assert.equal(t.unlockable, true);
  });

  test("puts up no paywall when the find is under the minimum", () => {
    const thin = teaser([
      { id: "x", per: "2026", subject: "Something", observation: "Something small.", worth: 40, action: "Do.", workings: "40.", source: [] },
    ]);
    assert.equal(thin.unlockable, false);
    assert.equal(thin.sample, undefined);
    assert.match(thin.text, /nothing to sell you and nothing to pay/);
    // No refund can ever be needed, because no money changed hands.
    assert.ok(!thin.text.includes(`€${MINIMUM_WORTH} for all`));
  });

  test("says nothing at all when the file was clean", () => {
    const none = teaser(findAll(clean));
    assert.equal(none.found, 0);
    assert.equal(none.unlockable, false);
  });

  test("still withholds the answer when there is only one finding", () => {
    // The single-finding case is the one most tempting to give away, because
    // holding one thing back looks stingy. It is also the case where handing
    // it over leaves nothing to sell at all.
    const single = teaser([findAll(allc)[0]]);
    assert.equal(single.count, 1);
    assert.equal(single.locked.length, 1);
    assert.match(single.text, /1 finding\b/);
    assert.match(single.text, /€36,400/);
    assert.ok(!/Check:/.test(single.text));
    assert.ok(!/Do:/.test(single.text));
  });
});

describe("the ladder, because a rate that low exists for a reason", () => {
  const [freight] = recoveryGap(allc);

  test("starts small rather than at the ceiling", () => {
    assert.ok(freight.ladder);
    assert.match(freight.ladder[0].move, /5 more points/);
    assert.equal(round(freight.ladder[0].worth), 4_090);
  });

  test("ends at full recovery, labelled as the limit and not as advice", () => {
    const last = freight.ladder!.at(-1)!;
    assert.match(last.move, /Recover all of it/);
    assert.equal(round(last.worth), 36_400);
    assert.match(freight.workings, /ceiling, reached only at full recovery/);
  });

  test("prices the volume each step can safely cost", () => {
    // €4,090 recovered at a 36.8% contribution margin pays for €11,114 of
    // revenue walking away, which is 0.5% of this company's turnover.
    const [first] = freight.ladder!;
    assert.equal(round(first.breakEvenRevenue!), 11_114);
    assert.ok(first.breakEvenShare! < 0.005);
    assert.match(freight.action, /less than 0\.5% of turnover in lost business/);
  });

  test("says so rather than guessing when it cannot price the risk", () => {
    const [blind] = recoveryGap({ ...allc, contributionMargin: undefined });
    assert.equal(blind.ladder![0].breakEvenShare, undefined);
    assert.match(blind.caveat!, /not what it can safely cost/);
    assert.match(blind.action, /Start small/);
  });
});

describe("the portrait, which is what a reader gets before anything is found", () => {
  const t = teaser(findAll(allc), allc);

  test("opens with facts about their business, not with our number", () => {
    // The founder sat through a meeting about his own annual accounts and
    // understood none of it. Four true sentences about the company come first;
    // whether anything is wrong comes second.
    assert.match(t.text, /^Here is what your file says\./);
    assert.match(t.text, /Turnover, trend 2026\s+€2,389,560/);
    assert.ok(t.text.indexOf("Turnover") < t.text.indexOf("found €"));
  });

  test("says what is left after direct costs in cents, not as a ratio", () => {
    assert.match(t.text, /Left after direct costs\s+37 cents in every euro/);
  });

  test("names the biggest cost of each kind, which most owners cannot", () => {
    assert.match(t.text, /Biggest cost that moves with volume\s+Fulfilment, 4\.2% of turnover/);
    assert.match(t.text, /Biggest cost that does not\s+Personeelskosten, 22\.0% of turnover/);
  });

  test("still gives the portrait when there is nothing to sell", () => {
    // A clean file is the case where a reader has paid nothing and learned
    // nothing. The four facts are the whole reason that visit was not wasted.
    const none = teaser(findAll(clean), clean);
    assert.equal(none.unlockable, false);
    assert.match(none.text, /Here is what your file says/);
    assert.match(none.text, /nothing to sell you and nothing to pay/);
  });

  test("says nothing about the business when it was not given the figures", () => {
    const bare = teaser(findAll(allc));
    assert.ok(!bare.text.includes("Here is what your file says"));
  });
});

describe("every finding explains itself before it names their number", () => {
  const report = render(findAll(allc));

  test("leads with what the thing is, in words, with no figures in it", () => {
    assert.match(report.text, /1\. A cost you pay and the line that bills it back/);
    assert.match(report.text, /Yours:  You recover 55\.5%/);
  });

  test("puts the explanation above their case, not below it", () => {
    assert.ok(report.text.indexOf("A cost you pay") < report.text.indexOf("Yours:"));
  });

  test("keeps the explanation free of their figures, so it reads the same on every file", () => {
    for (const f of findAll(allc)) {
      assert.ok(f.plainly, `${f.id} has no plain-language explanation`);
      assert.ok(!/[€%]|\d/.test(f.plainly), `${f.id} put figures in its explanation`);
    }
  });
});
