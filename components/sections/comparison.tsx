import { Section, SectionHeader } from "@/components/layout/section";
import { Comparison as ComparisonTable } from "@/components/mdx/blocks";

const rows = [
  ["You need to know", "Which questions to ask", "Nothing. The questions are the product"],
  ["The arithmetic", "You check it yourself", "Checked before anything runs, cell by cell"],
  ["The answer", "Different on every run", "The same file gives the same report, always"],
  ["When it finds nothing", "It answers anyway", "It says so, and there is nothing to pay"],
];

/** Uses the same table component authors get in MDX — one implementation. */
export function Comparison() {
  return (
    <Section bordered>
      <SectionHeader
        eyebrow="Comparison"
        title="Could I not just paste this into ChatGPT?"
        description="You can, and you would get something useful. You would also have to know which questions to ask, verify that nothing was invented, and decide whether the answer is safe to act on. That is the €9."
      />

      <ComparisonTable columns={["", "ChatGPT", "MarginGraph"]} rows={rows} />
    </Section>
  );
}
