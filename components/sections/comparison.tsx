import { Section, SectionHeader } from "@/components/layout/section";
import { Comparison as ComparisonTable } from "@/components/mdx/blocks";

const rows = [
  ["Scope", "General purpose", "Purpose-built for one decision"],
  ["Getting started", "You write the prompt", "The prompt is already written and tested"],
  ["Method", "Depends on how you ask", "The same methodology every time"],
  ["Output", "Prose, different on each run", "A structured report, ready to decide on"],
];

/** Uses the same table component authors get in MDX — one implementation. */
export function Comparison() {
  return (
    <Section bordered>
      <SectionHeader
        eyebrow="Comparison"
        title="Why not ChatGPT?"
        description="You can do a lot of this in a general-purpose assistant. The difference is not intelligence — it is repeatability."
      />

      <ComparisonTable columns={["", "ChatGPT", "MarginGraph"]} rows={rows} />
    </Section>
  );
}
