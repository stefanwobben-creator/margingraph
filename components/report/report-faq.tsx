import { Section, SectionHeader } from "@/components/layout/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ReportPage } from "@/lib/report-page";

/**
 * FAQ, rendered as an accordion. The answers are also emitted as FAQPage
 * JSON-LD so search engines and AI assistants read the same text a visitor
 * does — the markup never asserts anything the page does not show.
 */
export function ReportFaq({ faq }: { faq: ReportPage["faq"] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <Section id="faq" bordered>
      <script
        type="application/ld+json"
        // Content is static and author-controlled.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SectionHeader eyebrow="FAQ" title="Questions people ask first" />

      <Accordion type="single" collapsible className="mt-10 max-w-3xl">
        {faq.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
