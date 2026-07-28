import type { Reasoner } from "../reasoner";
import type { EvidenceGrade } from "../../types/assessment";
import type { EvidenceKind } from "../../types/evidence";
import { provenanceSpecificity } from "../../types/provenance";

/**
 * Base credibility by how the evidence came to be known.
 *
 * "stated" scores lowest deliberately: a figure asserted by a party with an
 * interest in the answer is the weakest form of evidence there is, however
 * confidently it is asserted.
 */
const KIND_WEIGHT: Record<EvidenceKind, number> = {
  measured: 1,
  external: 0.85,
  derived: 0.7,
  stated: 0.45,
};

/**
 * Grades evidence on two axes the kernel can judge without domain knowledge:
 * how it was obtained, and how precisely its source is recorded.
 *
 * Domain modules cannot grade their own evidence. If they could, every
 * analyzer would grade generously and the score would mean nothing.
 */
export const evidenceQualityReasoner: Reasoner = {
  id: "evidence-quality",
  version: "1.0.0",

  run({ index }) {
    const grades: EvidenceGrade[] = index.set.evidence.map((item) => {
      const kindScore = KIND_WEIGHT[item.kind];
      const specificity = provenanceSpecificity(item.provenance);
      const notes: string[] = [];

      if (item.kind === "stated") {
        notes.push("Asserted rather than measured.");
      }
      if (specificity < 0.5) {
        notes.push("Source is recorded, but not to a specific location.");
      }
      if (item.asOf) {
        notes.push(`Valid as of ${item.asOf}.`);
      }

      // Weighted toward how it was obtained; a precise reference to a weak
      // source does not make the source strong.
      const quality = kindScore * 0.7 + specificity * 0.3;

      return { evidenceId: item.id, quality, notes };
    });

    return { evidenceGrades: grades };
  },
};
