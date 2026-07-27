import { Section, SectionHeader } from "@/components/layout/section";
import type { ReportPage } from "@/lib/report-page";

export function ReportMethod({ method }: { method: ReportPage["method"] }) {
  return (
    <Section bordered>
      <SectionHeader
        eyebrow="Method"
        title="How the AI works"
        description="No black box. Five steps, in the order they happen."
      />

      <ol className="mt-12 max-w-3xl">
        {method.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-border py-7 first:border-t-0 first:pt-0 sm:grid-cols-[3.5rem_1fr]"
          >
            <span className="pt-0.5 font-mono text-sm text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-base font-medium">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
