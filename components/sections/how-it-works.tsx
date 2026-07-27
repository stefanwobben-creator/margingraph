import { FileOutput, Sparkles, Upload } from "lucide-react";

import { Section, SectionHeader } from "@/components/layout/section";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    body: "A spreadsheet, an export from your accounting software, a PDF. Whatever you already have — no template to fill in first.",
  },
  {
    icon: Sparkles,
    title: "AI Analysis",
    body: "The file is read, the figures are checked against each other, and the method for that specific question is applied.",
  },
  {
    icon: FileOutput,
    title: "Decision Report",
    body: "The answer, the calculation behind it, the assumptions it rests on, and what would have to be true for it to change.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" bordered>
      <SectionHeader eyebrow="How it works" title="Three steps, a few minutes" />

      <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {steps.map((step, index) => (
          <li key={step.title} className="relative">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border">
                <step.icon aria-hidden className="size-4" />
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <h3 className="mt-5 text-base font-medium">{step.title}</h3>
            <p className="mt-2.5 text-sm text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
