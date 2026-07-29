import { FileOutput, Mail, Sparkles } from "lucide-react";

import { Section, SectionHeader } from "@/components/layout/section";

/**
 * The three steps, as they actually happen.
 *
 * This section said "Upload", "AI Analysis" and "a few minutes". There is no
 * upload button, a person is still in the loop, and it takes hours rather than
 * minutes: three sentences, three untruths, on the section that sets every
 * expectation a visitor arrives with. Someone told the wrong thing here does
 * not complain, they leave, and nothing in the analytics says why.
 */
const steps = [
  {
    icon: Mail,
    title: "You send a file",
    body: "A spreadsheet, an export from your accounting software, a PDF. Whatever you already have, by email. There is no template to fill in first.",
  },
  {
    icon: Sparkles,
    title: "We read it, and check it adds up",
    body: "Every subtotal is added back up and compared with what the file says. If the arithmetic closes we read it correctly, and only then does the analysis run.",
  },
  {
    icon: FileOutput,
    title: "You see what we found, then decide",
    body: "The total, how many findings there are and what each one is about, before anything is for sale. €9 unlocks the workings and the actions, and under €90 found there is nothing to pay.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" bordered>
      <SectionHeader eyebrow="How it works" title="Three steps, and you see the total before you pay" />

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
