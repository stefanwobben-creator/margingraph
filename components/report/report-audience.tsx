import { Check } from "lucide-react";

import { Section, SectionHeader } from "@/components/layout/section";

export function ReportAudience({ audience }: { audience: string[] }) {
  return (
    <Section bordered>
      <SectionHeader eyebrow="Audience" title="Who is this for?" />

      <ul className="mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
        {audience.map((item) => (
          <li key={item} className="flex gap-3">
            <Check
              aria-hidden
              className="mt-1 size-4 shrink-0 text-accent-brand"
            />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
