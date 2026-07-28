import { describe, test } from "vitest";
// Node's assert rather than expect(): the assertions here are about structure
// and numbers, and assert reads closer to the thing being claimed.
import assert from "node:assert/strict";

import { createAssumption, reason, runPipeline } from "..";
import {
  bridgeAnalyzer,
  bridgeTemplate,
  cropAnalyzer,
  cropTemplate,
  fileEvidence,
  knowledge,
} from "./fixtures";

const RUN = { generatedAt: "2026-07-28T00:00:00.000Z", inputDigest: "sha256:test" };

describe("two unrelated domains, one kernel", () => {
  test("a structural report composes end to end", async () => {
    const report = await runPipeline({
      ...RUN,
      reportId: "r-1",
      template: bridgeTemplate,
      analyzer: bridgeAnalyzer,
      knowledge,
      evidence: [
        fileEvidence({ id: "ev-span", statement: "Span is 24m", amount: 24, unit: "m", cell: "B4" }),
      ],
      assumptions: [],
    });

    assert.equal(report.chapters.length, 1);
    assert.equal(report.chapters[0].claims.length, 1);
    assert.equal(report.chapters[0].claims[0].confidence.band, "high");
  });

  test("an agronomy report composes through the same kernel", async () => {
    const report = await runPipeline({
      ...RUN,
      reportId: "r-2",
      template: cropTemplate,
      analyzer: cropAnalyzer,
      knowledge,
      evidence: [
        fileEvidence({ id: "ev-rainfall", statement: "Rainfall 612mm", amount: 612, unit: "mm" }),
      ],
      assumptions: [],
    });

    assert.equal(report.chapters[0].claims.length, 2);
  });

  test("a template cannot be run against the wrong domain", async () => {
    await assert.rejects(
      runPipeline({
        ...RUN,
        reportId: "r-3",
        template: bridgeTemplate,
        analyzer: cropAnalyzer,
        knowledge,
        evidence: [],
        assumptions: [],
      }),
      /expects domain "structural"/,
    );
  });
});

describe("the engine reasons without knowing the domain", () => {
  test("detects a contradiction between two claims about the same metric", async () => {
    const report = await runPipeline({
      ...RUN,
      reportId: "r-4",
      template: cropTemplate,
      analyzer: cropAnalyzer,
      knowledge,
      evidence: [
        fileEvidence({ id: "ev-rainfall", statement: "Rainfall 612mm", amount: 612, unit: "mm" }),
      ],
      assumptions: [],
    });

    const contradictions = report.assessment.contradictions;
    assert.equal(contradictions.length, 1);
    assert.equal(contradictions[0].kind, "value");
    // 9.2 vs 5.1 — the engine has no idea what t/ha means and still knows
    // these disagree.
    assert.ok(contradictions[0].severity > 0.4);
  });

  test("a contradiction lowers confidence on both claims", async () => {
    const report = await runPipeline({
      ...RUN,
      reportId: "r-5",
      template: cropTemplate,
      analyzer: cropAnalyzer,
      knowledge,
      evidence: [
        fileEvidence({ id: "ev-rainfall", statement: "Rainfall 612mm", amount: 612, unit: "mm" }),
      ],
      assumptions: [],
    });

    for (const entry of report.assessment.confidence) {
      assert.ok(entry.components.consistency < 1);
      assert.ok(entry.reasons.some((r) => r.includes("disagrees")));
    }
  });

  test("an ungrounded claim is flagged and cannot reach high confidence", () => {
    const assessment = reason({
      claims: [
        {
          id: "c1" as never,
          subject: "x",
          metric: "y",
          statement: "Something is true.",
          evidence: [],
          assumptions: [],
          derivedFrom: [],
          producedBy: { id: "test", version: "1.0.0" },
        },
      ],
      evidence: [],
      assumptions: [],
    });

    assert.equal(assessment.traceability[0].issue, "ungrounded");
    assert.equal(assessment.confidence[0].band, "insufficient");
  });

  test("stated evidence scores below measured evidence", () => {
    const assessment = reason({
      claims: [],
      evidence: [
        fileEvidence({ id: "e-measured", statement: "m", amount: 1, unit: "x" }),
        fileEvidence({ id: "e-stated", statement: "s", amount: 1, unit: "x", kind: "stated" }),
      ],
      assumptions: [],
    });

    const measured = assessment.evidenceGrades.find((g) => g.evidenceId === "e-measured")!;
    const stated = assessment.evidenceGrades.find((g) => g.evidenceId === "e-stated")!;
    assert.ok(measured.quality > stated.quality);
  });

  test("counterarguments rank by effect, then by leverage", async () => {
    const report = await runPipeline({
      ...RUN,
      reportId: "r-6",
      template: cropTemplate,
      analyzer: cropAnalyzer,
      knowledge,
      evidence: [
        fileEvidence({ id: "ev-rainfall", statement: "Rainfall 612mm", amount: 612, unit: "mm" }),
      ],
      assumptions: [
        createAssumption({
          id: "as-price",
          statement: "Prices hold.",
          origin: "user",
          impact: "weakens",
          provenance: { type: "user", field: "price" },
        }),
      ],
    });

    const [first] = report.assessment.counterarguments;
    // The analyzer's own soil assumption inverts a claim; the user's price
    // assumption only weakens one. Inverting outranks weakening.
    assert.equal(first.effect, "inverts");
    assert.ok(first.leverage > 0);
  });
});

describe("the manifest records what produced the report", () => {
  test("captures engine, template, analyzer, reasoners and knowledge", async () => {
    const report = await runPipeline({
      ...RUN,
      reportId: "r-7",
      template: cropTemplate,
      analyzer: cropAnalyzer,
      knowledge,
      evidence: [],
      assumptions: [],
    });

    const m = report.manifest;
    assert.equal(m.template.version, "3.2.1");
    assert.equal(m.analyzer.version, "0.4.0");
    assert.equal(m.knowledge["test-knowledge"], "2026-q3");
    assert.equal(m.reasoners.confidence, "1.0.0");
    assert.equal(Object.keys(m.reasoners).length, 6);
    assert.ok(m.engine.length > 0);
    assert.equal(m.generatedAt, RUN.generatedAt);
  });

  test("the same inputs produce the same report", async () => {
    const run = () =>
      runPipeline({
        ...RUN,
        reportId: "r-8",
        template: cropTemplate,
        analyzer: cropAnalyzer,
        knowledge,
        evidence: [
          fileEvidence({ id: "ev-rainfall", statement: "R", amount: 612, unit: "mm" }),
        ],
        assumptions: [],
      });

    const [a, b] = await Promise.all([run(), run()]);
    assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
  });
});
