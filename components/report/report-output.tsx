import { Section, SectionHeader } from "@/components/layout/section";

/**
 * Generic wrapper for the "what you receive" section. The preview itself is
 * bespoke per report and passed in as children.
 */
export function ReportOutput({ children }: { children: React.ReactNode }) {
  return (
    <Section bordered>
      <SectionHeader
        eyebrow="Output"
        title="What you receive"
        description="One document. The number, the range around it, what drives it, what threatens it, and what to do next."
      />

      <div className="mt-12">{children}</div>
    </Section>
  );
}
