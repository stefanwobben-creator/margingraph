import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqItem = { question: string; answer: string };

/**
 * Renders an FAQ. The JSON-LD for it is emitted by the page, from the same
 * frontmatter array — markup and page always show identical text.
 */
export function Faq({
  items,
  title = "Frequently asked",
  idPrefix = "faq",
}: {
  items: FaqItem[];
  title?: string;
  idPrefix?: string;
}) {
  if (!items.length) return null;

  return (
    <section id="faq" className="my-14 scroll-mt-24 not-prose">
      <h2 className="text-title">{title}</h2>
      <Accordion type="single" collapsible className="mt-8">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`${idPrefix}-${index}`}>
            <AccordionTrigger className="text-left text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
