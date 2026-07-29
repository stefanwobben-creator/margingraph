import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { MINIMUM_WORTH, REPORT_PRICE } from "@/lib/reports/findings";
import { seller } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "What you get, what it costs, when you pay, and what happens when we find nothing. Short, because the offer is short.",
  alternates: { canonical: "/terms" },
};

/**
 * Terms, kept to a page.
 *
 * A €9 product does not need eleven sections of boilerplate, and boilerplate is
 * how a small print becomes a place to hide. The commercial terms here are the
 * same ones stated on the sales pages, which is the point: if the two ever
 * disagree, the sales page was lying.
 *
 * The seller details are deliberately read from site config rather than typed
 * here, so a page that names the wrong legal entity fails to build instead of
 * quietly going live.
 */
export default function TermsPage() {
  return (
    <Section>
      <SectionHeader
        as="h1"
        eyebrow="Legal"
        title="Terms"
        description="The whole agreement fits on one page. If anything here contradicts a sales page, this page wins and the sales page is wrong."
      />

      <Container className="prose-content mt-10 max-w-2xl space-y-8 text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-semibold">Who you are contracting with</h2>
          <p className="mt-2 text-muted-foreground">
            {seller.legalName}, registered in the Netherlands, Chamber of Commerce
            number {seller.kvk}, VAT number {seller.vat}. Reachable at{" "}
            <a href={`mailto:${seller.email}`} className="underline underline-offset-4">
              {seller.email}
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">What you get</h2>
          <p className="mt-2 text-muted-foreground">
            You send one or more files. We check that we can read them, run our
            analysis, and show you what we found: the total, how many findings
            there are, and what each one is about. That part is free and you are
            under no obligation.
          </p>
          <p className="mt-2 text-muted-foreground">
            For €{REPORT_PRICE} you get the full report: which line in your own
            file each finding sits on, the arithmetic behind it, and what to do
            about it. That is what you pay, VAT included. We are the seller, so
            the invoice comes from us and carries the VAT number above.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">When we do not charge</h2>
          <p className="mt-2 text-muted-foreground">
            If the analysis finds less than €{MINIMUM_WORTH} in total, there is
            nothing to buy and no payment is requested. This is not a refund
            policy; no payment is taken in the first place.
          </p>
          <p className="mt-2 text-muted-foreground">
            If we cannot read your file we say so and charge nothing.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">
            What a report is, and what it is not
          </h2>
          <p className="mt-2 text-muted-foreground">
            A report states findings derived from the figures you supplied,
            together with the arithmetic that produced them. It is not
            accountancy, audit, tax, legal or investment advice, and it does not
            replace your accountant or adviser.
          </p>
          <p className="mt-2 text-muted-foreground">
            Every figure we produce carries its own workings so you can check it.
            We accept responsibility for the arithmetic being what we say it is.
            Decisions you take on the back of it remain yours, and our liability
            is limited to what you paid us for the report in question.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Cancellation</h2>
          <p className="mt-2 text-muted-foreground">
            The report is delivered immediately on payment, so the statutory
            fourteen-day right of withdrawal for consumers does not survive
            delivery, and by paying you agree to immediate delivery. If a report
            is wrong, tell us and we will correct it or refund it.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Your files</h2>
          <p className="mt-2 text-muted-foreground">
            Covered on the{" "}
            <a href="/privacy" className="underline underline-offset-4">
              privacy page
            </a>
            , in the same plain terms.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Law</h2>
          <p className="mt-2 text-muted-foreground">
            Dutch law applies. Disputes go to the competent court in the
            Netherlands, and before that, to whoever answers the email address
            above.
          </p>
        </div>
      </Container>
    </Section>
  );
}
