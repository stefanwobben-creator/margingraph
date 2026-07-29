import { describe, test } from "vitest";
import assert from "node:assert/strict";

import { disagreements, reconcile, toleranceFor, type Statement } from "..";
import {
  PROFIT_AND_LOSS,
  q1Actual,
  yearBudgetAsAgreed,
  yearBudgetAsReported,
} from "./fixtures";

function check(verdict: ReturnType<typeof reconcile>, id: string) {
  const found = verdict.checks.find((c) => c.rollup === id);
  assert.ok(found, `no check for ${id}`);
  return found;
}

describe("tolerance is derived from the source, not chosen", () => {
  test("eleven lines at one decimal get six tenths of room", () => {
    assert.equal(toleranceFor({ parts: 11, precision: 0.1 }), 0.6);
  });

  test("a subtotal of one part still gets its own rounding step", () => {
    assert.equal(toleranceFor({ parts: 1, precision: 0.1 }), 0.1);
  });

  test("exact figures get no room at all", () => {
    assert.equal(toleranceFor({ parts: 40, precision: 0 }), 0);
  });

  test("a negative precision is a programming error, not a loose gate", () => {
    assert.throws(() => toleranceFor({ parts: 3, precision: -0.1 }), RangeError);
  });
});

describe("a statement that adds up", () => {
  const verdict = reconcile(q1Actual);

  test("passes", () => {
    assert.equal(verdict.status, "green");
    assert.deepEqual(verdict.blocking, []);
  });

  test("absorbs legitimate rounding drift rather than failing on it", () => {
    // 207.4 stated against 207.3 computed. Real rounding, not an error.
    const costs = check(verdict, "total-costs");
    assert.equal(costs.status, "ok");
    assert.equal(costs.drift, 0.1);
    assert.ok(Math.abs(costs.drift) <= costs.tolerance);
  });

  test("records the blank line it treated as zero instead of hiding it", () => {
    const costs = check(verdict, "total-costs");
    assert.deepEqual(costs.missing, ["overige-kosten"]);
    assert.equal(costs.counted, 10);
  });

  test("says so in one sentence", () => {
    assert.match(verdict.summary, /every subtotal reproduces/);
  });
});

describe("the budget column every variance is measured against", () => {
  const verdict = reconcile(yearBudgetAsReported);

  test("is amber, not green", () => {
    assert.equal(verdict.status, "amber");
  });

  test("isolates the failure to a single cell", () => {
    assert.deepEqual(verdict.blocking, ["marge-na-vracht"]);
  });

  test("names the gap", () => {
    const margin = check(verdict, "marge-na-vracht");
    assert.equal(margin.status, "mismatch");
    assert.equal(margin.stated, 1414.4);
    assert.equal(margin.computed, 1133.0);
    assert.equal(margin.drift, 281.4);
  });

  test("finds no sign reading of its own parts that produces the stated figure", () => {
    // This is the strong result. A mismatch alone could be a misread credit;
    // zero repairs means the number did not come from the rows above it.
    const margin = check(verdict, "marge-na-vracht");
    assert.deepEqual(margin.repairs, []);
    assert.match(verdict.summary, /no single sign reading/);
  });

  test("passes everything below the broken cell, which is why nobody caught it", () => {
    for (const id of ["total-costs", "trading-results", "profit", "net-profit"]) {
      assert.equal(check(verdict, id).status, "ok", `${id} should reconcile`);
    }
  });
});

describe("the same budget on the tab where it was agreed", () => {
  const verdict = reconcile(yearBudgetAsAgreed);

  test("closes under the identical rollup definition", () => {
    assert.equal(verdict.status, "green");
    assert.equal(check(verdict, "marge-na-vracht").computed, 1267.2);
  });
});

describe("two versions of one budget in one workbook", () => {
  const found = disagreements({
    left: yearBudgetAsReported,
    right: yearBudgetAsAgreed,
  });
  const by = (id: string) => found.find((d) => d.cell === id);

  test("surfaces the freight line the two tabs disagree about", () => {
    const freight = by("doorberekende-vracht");
    assert.ok(freight);
    assert.equal(freight.left, 82.7);
    assert.equal(freight.right, -51.5);
  });

  test("carries the difference all the way to the bottom line", () => {
    assert.equal(by("marge-na-vracht")?.difference, 147.2);
    assert.equal(by("trading-results")?.difference, 147.2);
    assert.equal(by("net-profit")?.difference, 147.2);
  });

  test("leaves the figures the two tabs agree on alone", () => {
    assert.equal(by("net-turnover"), undefined);
    assert.equal(by("personeelskosten"), undefined);
    assert.equal(by("total-costs"), undefined);
  });

  test("does not flag the tax line, because arithmetic cannot see it", () => {
    // Tax is 80.8 in both columns although profit differs by 147.2, so one of
    // the two carries an effective rate of 17.2% and the other 25.0%. Both
    // subtract correctly, so the gate passes them. Catching this needs to know
    // what tax is, and the gate deliberately knows nothing.
    assert.equal(by("tax"), undefined);
    assert.equal(reconcile(yearBudgetAsReported).checks.find((c) => c.rollup === "net-profit")?.status, "ok");
  });
});

describe("what the gate refuses to do", () => {
  const bare: Statement = {
    id: "bare",
    label: "A page with a total and nothing under it",
    precision: 0.1,
    cells: [
      { id: "total", label: "Total", value: 100 },
      { id: "a", label: "A", value: null },
      { id: "b", label: "B", value: null },
    ],
    rollups: [{ id: "total", parts: [{ cell: "a", sign: 1 }, { cell: "b", sign: 1 }] }],
  };

  test("goes red when there is nothing to test rather than guessing", () => {
    const verdict = reconcile(bare);
    assert.equal(verdict.status, "red");
    assert.match(verdict.summary, /nothing here could be checked/);
  });

  test("goes red when the stated subtotal itself is absent", () => {
    const verdict = reconcile({
      ...bare,
      cells: [
        { id: "total", label: "Total", value: null },
        { id: "a", label: "A", value: 40 },
        { id: "b", label: "B", value: 60 },
      ],
    });
    assert.equal(verdict.status, "red");
    assert.equal(check(verdict, "total").status, "incomplete");
  });

  test("rejects a statement that names the same figure twice", () => {
    assert.throws(
      () =>
        reconcile({
          id: "dupe",
          label: "Duplicate",
          precision: 0.1,
          cells: [
            { id: "a", label: "A", value: 1 },
            { id: "a", label: "A again", value: 2 },
          ],
          rollups: [],
        }),
      /duplicate cell id a/,
    );
  });
});

describe("a mismatch that one sign flip explains", () => {
  test("names the cell to ask about", () => {
    // The same column, with the freight line typed as a debit rather than a
    // credit. This is the ordinary case, and the gate should turn it into a
    // question rather than a shrug.
    const misTyped: Statement = {
      ...yearBudgetAsAgreed,
      id: "mistyped",
      cells: yearBudgetAsAgreed.cells.map((c) =>
        c.id === "doorberekende-vracht" ? { ...c, value: 51.5 } : c,
      ),
    };
    const margin = check(reconcile(misTyped), "marge-na-vracht");
    assert.equal(margin.status, "mismatch");
    assert.deepEqual(margin.repairs, [
      { cell: "doorberekende-vracht", from: -1, to: 1 },
    ]);
    assert.match(reconcile(misTyped).summary, /one sign flip on doorberekende-vracht/);
  });
});

describe("the rollup definition is not fitted to any one column", () => {
  test("all three columns run through the identical definition", () => {
    for (const s of [q1Actual, yearBudgetAsReported, yearBudgetAsAgreed]) {
      assert.equal(s.rollups, PROFIT_AND_LOSS);
    }
  });
});

describe("a total that overshoots a partial reading", () => {
  const partial: Statement = {
    id: "filed",
    label: "A filed balance sheet with an untagged line",
    precision: 1,
    cells: [
      { id: "net-current", label: "Net current assets", value: 46_111 },
      { id: "total", label: "Total assets less current liabilities", value: 106_078 },
    ],
    rollups: [
      // The reader collected what the filing happened to tag, so it cannot
      // claim the list is exhaustive.
      { id: "total", parts: [{ cell: "net-current", sign: 1 }], complete: false },
    ],
  };

  test("is a shortfall, not a contradiction", () => {
    const verdict = reconcile(partial);
    assert.equal(check(verdict, "total").status, "shortfall");
    assert.equal(check(verdict, "total").drift, 59_967);
  });

  test("is amber, because the owner still has to be asked", () => {
    assert.equal(reconcile(partial).status, "amber");
  });

  test("is not chargeable, because nothing is wrong with their figures", () => {
    assert.equal(reconcile(partial).chargeable, false);
  });

  test("says the gap is in the file rather than in the figures", () => {
    assert.match(reconcile(partial).summary, /never published/);
    assert.match(reconcile(partial).summary, /gap in the file, not in the figures/);
  });

  test("offers no sign flip, because there is nothing to repair", () => {
    assert.deepEqual(check(reconcile(partial), "total").repairs, []);
  });

  test("the same numbers under a complete reading stay a contradiction", () => {
    const complete = {
      ...partial,
      rollups: [{ id: "total", parts: [{ cell: "net-current", sign: 1 as const }] }],
    };
    assert.equal(check(reconcile(complete), "total").status, "mismatch");
    assert.equal(reconcile(complete).chargeable, true);
  });
});

describe("chargeability", () => {
  test("a clean statement is not chargeable either, because it found nothing", () => {
    assert.equal(reconcile(q1Actual).chargeable, false);
  });

  test("a real contradiction is", () => {
    assert.equal(reconcile(yearBudgetAsReported).chargeable, true);
  });
});
