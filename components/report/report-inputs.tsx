import { Section, SectionHeader } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ReportPage } from "@/lib/report-page";

export function ReportInputs({ inputs }: { inputs: ReportPage["inputs"] }) {
  return (
    <Section bordered>
      <SectionHeader
        eyebrow="Inputs"
        title="What you upload"
        description="Whatever you already have. Nothing needs to be cleaned, renamed or fitted to a template first."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {inputs.map((input) => (
          <Card key={input.title} className="gap-0 p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-medium">{input.title}</h3>
              {input.optional ? (
                <Badge variant="secondary" className="shrink-0">
                  Optional
                </Badge>
              ) : null}
            </div>

            <p className="mt-2.5 text-sm text-muted-foreground">
              {input.description}
            </p>

            <p className="mt-5 font-mono text-xs text-muted-foreground">
              {input.formats}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
