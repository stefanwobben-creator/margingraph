import type {
  Analyzer,
  KnowledgeSource,
  TemplateDefinition,
} from "../contracts";
import {
  createAssumption,
  createClaim,
  createEvidence,
} from "..";
import type { Evidence, SourceId } from "..";

/**
 * Two deliberately unrelated domains.
 *
 * Neither is a product. They exist to prove one thing: that two analyzers with
 * nothing in common produce reports through the same kernel without either of
 * them containing a line of epistemic logic. If a future report needs to add
 * something to the kernel to work, that is a signal the boundary has moved.
 */

export const knowledge: KnowledgeSource = {
  id: "test-knowledge",
  version: "1.0.0",
  snapshot: "2026-q3",
  async lookup() {
    return undefined;
  },
};

export function fileEvidence(input: {
  id: string;
  statement: string;
  amount: number;
  unit: string;
  cell?: string;
  kind?: Evidence["kind"];
}): Evidence {
  return createEvidence({
    id: input.id,
    kind: input.kind ?? "measured",
    statement: input.statement,
    value: { amount: input.amount, unit: input.unit },
    provenance: {
      type: "file",
      sourceId: "src-1" as SourceId,
      filename: "input.xlsx",
      location: { sheet: "Sheet1", cell: input.cell ?? "A1" },
      extractedBy: { id: "test-extractor", version: "1.0.0" },
    },
  });
}

/* ---------------------------------------------------------------- domain A */
/* Bridge load. Structural engineering — no money anywhere.                   */

export const bridgeAnalyzer: Analyzer = {
  id: "bridge",
  version: "2.1.0",
  domain: "structural",
  async analyze({ evidence, assumptions }) {
    const span = evidence.find((e) => e.id === "ev-span");
    return {
      claims: [
        createClaim({
          id: "cl-capacity",
          subject: "bridge",
          metric: "load_capacity",
          statement: "The bridge carries 40 tonnes.",
          value: { amount: 40, unit: "tonnes" },
          evidence: span ? [span.id] : [],
          assumptions: assumptions.map((a) => a.id),
          derivedFrom: [],
          producedBy: { id: "bridge", version: "2.1.0" },
          tags: ["headline"],
        }),
      ],
    };
  },
};

export const bridgeTemplate: TemplateDefinition = {
  id: "bridge-inspection",
  version: "1.0.0",
  domain: "structural",
  title: "Bridge inspection",
  audience: "Municipal engineers",
  tone: "technical",
  requiredInputs: ["survey"],
  chapters: [
    {
      id: "headline",
      title: "Capacity",
      select: { tags: ["headline"] },
      emptyText: "No capacity could be established.",
    },
  ],
};

/* ---------------------------------------------------------------- domain B */
/* Crop yield. Agriculture — nothing shared with domain A but the kernel.     */

export const cropAnalyzer: Analyzer = {
  id: "crop",
  version: "0.4.0",
  domain: "agronomy",
  async analyze({ evidence, assumptions }) {
    const rainfall = evidence.find((e) => e.id === "ev-rainfall");
    const derivedAssumption = createAssumption({
      id: "as-soil",
      statement: "Soil quality is unchanged from last season.",
      origin: "analyzer",
      impact: "inverts",
      provenance: { type: "user", field: "soil" },
    });

    return {
      assumptions: [derivedAssumption],
      claims: [
        createClaim({
          id: "cl-yield-optimistic",
          subject: "field-7",
          metric: "expected_yield",
          statement: "Field 7 yields 9.2 tonnes per hectare.",
          value: { amount: 9.2, unit: "t/ha" },
          evidence: rainfall ? [rainfall.id] : [],
          assumptions: [derivedAssumption.id, ...assumptions.map((a) => a.id)],
          derivedFrom: [],
          producedBy: { id: "crop", version: "0.4.0" },
          tags: ["headline"],
        }),
        createClaim({
          id: "cl-yield-conservative",
          subject: "field-7",
          metric: "expected_yield",
          statement: "Field 7 yields 5.1 tonnes per hectare.",
          value: { amount: 5.1, unit: "t/ha" },
          evidence: rainfall ? [rainfall.id] : [],
          assumptions: [],
          derivedFrom: [],
          producedBy: { id: "crop", version: "0.4.0" },
          tags: ["headline"],
        }),
      ],
    };
  },
};

export const cropTemplate: TemplateDefinition = {
  id: "crop-forecast",
  version: "3.2.1",
  domain: "agronomy",
  title: "Crop forecast",
  audience: "Growers",
  tone: "plain",
  requiredInputs: ["rainfall"],
  chapters: [
    { id: "headline", title: "Expected yield", select: { tags: ["headline"] } },
  ],
};
