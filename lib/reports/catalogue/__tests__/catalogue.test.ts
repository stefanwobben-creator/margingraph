import { describe, test } from "vitest";
import assert from "node:assert/strict";

import { REPORTS, offer, renderOffer, sellableCount } from "..";
import { questionsForYourAccountant, renderQuestions } from "@/lib/reports/questions";
import { allc, clean } from "@/lib/reports/findings/__tests__/fixtures";

describe("what one file can be turned into", () => {
  test("sells what is built, and says why the rest are not", () => {
    const got = offer({ input: allc });
    const sellable = got.filter((o) => o.sellable).map((o) => o.id);
    assert.deepEqual(sellable, ["margin", "accountant", "shock", "pricing"]);

    const unbuilt = got.filter((o) => o.because === "not built yet").map((o) => o.id);
    assert.deepEqual(unbuilt, ["valuation", "inventory"]);

    // Signals is built, but allc compares against a budget, and beating a
    // plan is not direction. The gate says that instead of "not built yet".
    const signals = got.find((o) => o.id === "signals")!;
    assert.equal(signals.sellable, false);
    assert.match(signals.because!, /beating a plan is not the same as getting stronger/);
  });

  test("runway joins the offer the moment a bank balance arrives", () => {
    // Without cash it is blocked for the honest reason, not the generic one.
    const without = offer({ input: allc }).find((o) => o.id === "runway")!;
    assert.equal(without.sellable, false);
    assert.match(without.because!, /no bank balance given/);

    const withCash = offer({ input: allc, cash: 100_000 }).find((o) => o.id === "runway")!;
    assert.equal(withCash.sellable, true);
    assert.equal(sellableCount({ input: allc, cash: 100_000 }), 5);
  });

  test("never offers a report the code cannot produce", () => {
    // The bundle price only means anything if this holds. Offering three and
    // delivering two is worse than not offering three.
    for (const o of offer({ input: allc })) {
      const definition = REPORTS.find((r) => r.id === o.id)!;
      if (o.sellable) assert.equal(definition.built, true, `${o.id} was offered unbuilt`);
    }
  });

  test("counts what the bundle can actually contain", () => {
    // Four sellable reports from one file: the €21 bundle is now a real
    // offer on this file rather than a price waiting for a product.
    assert.equal(sellableCount({ input: allc }), 4);
    assert.ok(sellableCount({ input: allc }) >= 3, "enough to honour three for €21");
  });

  test("withdraws the what-ifs when the file has no margin line", () => {
    const bare = { ...allc, contributionMargin: undefined };
    const got = offer({ input: bare });
    const shock = got.find((o) => o.id === "shock")!;
    assert.equal(shock.sellable, false);
    assert.match(shock.because!, /no gross margin line/);
    // The margin-leak report survives: it never needed the model.
    assert.equal(got.find((o) => o.id === "margin")!.sellable, true);
  });

  test("renders the offer as a ticklist with the bundle line", () => {
    const text = renderOffer({ input: allc });
    assert.match(text, /\[ \] Where is my margin leaking\?   €9/);
    assert.match(text, /any three from this same file for €21/);
    assert.match(text, /read by a person for now/);
  });

  test("gives the real reason, not a generic one", () => {
    const reasons = Object.fromEntries(offer({ input: allc }).map((o) => [o.id, o.because]));
    assert.equal(reasons.margin, undefined);
    assert.match(reasons.runway!, /no bank balance given/);
    assert.match(reasons.valuation!, /not built yet/);
  });

  test("a file that finds nothing still gets the questions, and they are free", () => {
    // A clean file is the case where somebody has learned that their figures
    // are in order. Refusing to produce anything would be punishing them for it.
    const got = offer({ input: clean });
    const margin = got.find((o) => o.id === "margin")!;
    assert.equal(margin.sellable, false);
    assert.match(margin.because!, /less than €90 worth acting on, so this one is free/);
  });

  test("says nothing can be read when nothing was", () => {
    const got = offer({});
    assert.ok(got.every((o) => !o.sellable));
    assert.match(got[0].because!, /no readable figures/);
  });
});

describe("the questions for your accountant", () => {
  const questions = questionsForYourAccountant(allc);

  test("carries their own figures, so it cannot be a generic checklist", () => {
    const text = renderQuestions(questions);
    assert.match(text, /55\.5%/);
    assert.ok(questions.length >= 4 && questions.length <= 6, "five give or take");
  });

  test("ends on the next twelve months rather than the last three", () => {
    const last = questions[questions.length - 1];
    assert.equal(last.id, "watch");
    assert.match(last.ask, /every month/);
  });

  test("every question says what a good answer sounds like", () => {
    // The point is not the question, it is being able to tell whether the
    // answer was one. Someone who cannot recognise a vague reply gets one.
    for (const q of questions) {
      assert.ok(q.why.length > 40, `${q.id} does not say why it matters`);
      assert.ok(q.good.length > 40, `${q.id} does not say what a good answer is`);
    }
  });

  test("turns the biggest finding into a question rather than an accusation", () => {
    const finding = questions.find((q) => q.id === "finding");
    assert.ok(finding);
    assert.match(finding.ask, /Was that a decision somebody took, or did it happen to us\?/);
  });

  test("asks about the budget when there is one to ask about", () => {
    const budget = questions.find((q) => q.id === "budget");
    assert.ok(budget);
    assert.match(budget.ask, /16\.2% below budget 2026/);
  });
});
