import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import {
  BUNDLE_PRICE,
  BUNDLE_SIZE,
  MINIMUM_WORTH,
  REPORT_PRICE,
} from "@/lib/reports/findings";
import { seller } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "What you get, what it costs, when you pay, what happens when we are wrong, and what we are not responsible for. One page, in plain language.",
  alternates: { canonical: "/terms" },
};

/** Change this when the substance changes, not when a comma moves. */
const VERSION = "1.1";
const EFFECTIVE = "29 July 2026";

/**
 * Terms, kept to a page.
 *
 * A €9 product does not need eleven sections of boilerplate, and boilerplate is
 * how small print becomes a place to hide. Everything commercial here is
 * repeated on the sales pages on purpose: if the two ever disagree, the sales
 * page was lying, and this page says so out loud.
 *
 * The seller details are read from site config rather than typed here, so a
 * page naming the wrong legal entity fails its test instead of going live.
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
        <p className="text-muted-foreground">
          Version {VERSION}, in force from {EFFECTIVE}. These terms apply to
          every report we produce. We may change them for future orders; the
          version in force when you ordered is the one that governs your order.
        </p>

        <div>
          <h2 className="text-base font-semibold">Who you are contracting with</h2>
          <p className="mt-2 text-muted-foreground">
            {seller.legalName}, registered in the Netherlands, Chamber of
            Commerce number {seller.kvk}, VAT number {seller.vat}. Reachable at{" "}
            <a href={`mailto:${seller.email}`} className="underline underline-offset-4">
              {seller.email}
            </a>
            . We are the seller of record: the invoice comes from us and carries
            that VAT number.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">What you get, in order</h2>
          <p className="mt-2 text-muted-foreground">
            You send one or more files. We check that we can read them, which
            means every subtotal has to reproduce from the lines above it. We
            then run the analysis and show you what we found: the total, how
            many findings there are, and what each one is about. That part is
            free and you are under no obligation.
          </p>
          <p className="mt-2 text-muted-foreground">
            For €{REPORT_PRICE} you get the full report: which line in your own
            file each finding sits on, the arithmetic behind the amount, and
            what to do about it, including how far a change can go before it
            starts costing you business. That is what you pay, VAT included.
          </p>
          <p className="mt-2 text-muted-foreground">
            One file can answer more than one question, and each answer is its
            own report at €{REPORT_PRICE}. Any {BUNDLE_SIZE} reports produced
            from the same file cost €{BUNDLE_PRICE} together. The minimum below
            applies to each report on its own, so a bundle can never be one
            useful report and two thin ones.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">When we do not charge</h2>
          <p className="mt-2 text-muted-foreground">
            If the analysis finds less than €{MINIMUM_WORTH} in total, there is
            nothing to buy and no payment is requested. This is not a refund
            policy: no payment is taken in the first place.
          </p>
          <p className="mt-2 text-muted-foreground">
            If we cannot read your file we say which cell stopped us, and charge
            nothing.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Paying</h2>
          <p className="mt-2 text-muted-foreground">
            Payment is handled by Mollie. We never see your card or bank
            details. The report is delivered by email once payment is
            confirmed, normally within a few hours.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Cancellation</h2>
          <p className="mt-2 text-muted-foreground">
            The report is delivered immediately on payment. If you are a
            consumer, you have a statutory fourteen-day right of withdrawal for
            digital content, and by paying you expressly agree that we begin
            delivery at once and acknowledge that you lose that right on
            delivery. If a report is wrong, that is covered below and does not
            depend on any withdrawal period.
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
            Every figure carries its own workings so that you can check it. We
            accept responsibility for the arithmetic being what we say it is: if
            a finding does not survive checking, tell us and we correct it or
            refund it, your choice. Decisions you take on the back of a report
            remain yours.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">The files you send</h2>
          <p className="mt-2 text-muted-foreground">
            You confirm you are entitled to send us what you send, and that
            doing so does not breach a duty you owe to somebody else. Where a
            file contains personal data, the{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              privacy page
            </Link>{" "}
            says how we handle it and a{" "}
            <Link href="/dpa" className="underline underline-offset-4">
              processing agreement
            </Link>{" "}
            is available.
          </p>
          <p className="mt-2 text-muted-foreground">
            Your figures stay yours. We treat them as confidential, we do not
            share them, and we do not use them to train anything.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Who owns what</h2>
          <p className="mt-2 text-muted-foreground">
            The report is yours, to use and share however you like inside your
            own business and with your own advisers. The method, the rules and
            the software behind it stay ours. Reselling reports, or using the
            service to produce reports for third parties as a product of your
            own, needs our agreement first.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">What we are liable for</h2>
          <p className="mt-2 text-muted-foreground">
            Our liability for any order is limited to what you paid us for the
            report in question. We are not liable for indirect or consequential
            loss, including lost profit, lost savings or lost business.
          </p>
          <p className="mt-2 text-muted-foreground">
            Nothing in these terms limits our liability for intent or deliberate
            recklessness, for death or personal injury, or for anything else
            that cannot be limited under Dutch law. Consumers keep every right
            Dutch consumer law gives them, whatever this page says.
          </p>
          <p className="mt-2 text-muted-foreground">
            This is a service delivered by email rather than a platform you log
            into, so we make no uptime commitment.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">If something goes wrong</h2>
          <p className="mt-2 text-muted-foreground">
            Email{" "}
            <a href={`mailto:${seller.email}`} className="underline underline-offset-4">
              {seller.email}
            </a>{" "}
            and say what is wrong. We answer within a few days. Dutch law
            applies and disputes go to the competent court in the Netherlands,
            but they should go to that email address first.
          </p>
        </div>
      </Container>
    </Section>
  );
}
