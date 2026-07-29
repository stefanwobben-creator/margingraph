import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { seller } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Where your file goes, who touches it on the way, how long it stays, and what never happens to it.",
  alternates: { canonical: "/privacy" },
};

/**
 * Privacy, written for the one question that actually stops people.
 *
 * Nobody uploading a profit and loss is worried about cookie categories. They
 * are worried about where their numbers end up, so that is answered in the
 * first sentence and everything else follows.
 *
 * An earlier version named "the language model provider used to read
 * documents" as a processor. There is no such provider: the gate and the rules
 * are ordinary deterministic code and no model sees a customer file. Naming a
 * processor that does not exist is worse than naming none, because it is the
 * one claim on this page that a careful reader would check.
 */
export default function PrivacyPage() {
  return (
    <Section>
      <SectionHeader
        as="h1"
        eyebrow="Legal"
        title="Privacy"
        description="You are about to send us your figures. This page exists to answer the only question that matters about that."
      />

      <Container className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-semibold">Where your file goes</h2>
          <p className="mt-2 text-muted-foreground">
            The upload is encrypted in transit, because the whole site is served
            over HTTPS and a browser will not send it any other way.
          </p>
          <p className="mt-2 text-muted-foreground">
            On arrival it is held in memory for a moment, attached to a single
            email addressed to{" "}
            <a href={`mailto:${seller.email}`} className="underline underline-offset-4">
              {seller.email}
            </a>
            , and released. We run no database and no file store, so that
            mailbox is the only place your file exists on our side. That is a
            deliberate design decision: a store nobody built is a store nobody
            can leave open.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">How long it stays</h2>
          <p className="mt-2 text-muted-foreground">
            No longer than thirty days, so we can still answer a question about
            a report you already have. Sooner if you ask: one email and it is
            gone, because there is exactly one place to delete it from.
          </p>
          <p className="mt-2 text-muted-foreground">
            It is not shared, not sold, and not used to train anything. The
            analysis is ordinary code with fixed rules, not a model that learns
            from what it reads, so there is nothing for your figures to be
            absorbed into.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Who else is involved</h2>
          <p className="mt-2 text-muted-foreground">
            Four suppliers touch this, each on our instruction and none of them
            for a purpose of their own:
          </p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <span className="text-foreground">Vercel</span> hosts the site and
              runs the code that receives your upload.
            </li>
            <li>
              <span className="text-foreground">Resend</span> delivers the
              intake email that carries your file to our mailbox.
            </li>
            <li>
              <span className="text-foreground">Our mail provider</span> holds
              that mailbox.
            </li>
            <li>
              <span className="text-foreground">Mollie</span> handles the
              payment, if you decide to buy the report. Your file never reaches
              them and we never see your card or bank details.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">
            Personal data inside your figures
          </h2>
          <p className="mt-2 text-muted-foreground">
            A profit and loss account is mostly not personal data, but a payroll
            line or a customer list can be. Where your file contains personal
            data, we process it only to produce your report and on your
            instruction, which makes us your processor for that part. The{" "}
            <Link href="/dpa" className="underline underline-offset-4">
              processing agreement
            </Link>{" "}
            covering that is already published and applies the moment you send a
            file, so there is nothing to negotiate first. If you need it signed
            on paper for your own records, ask and you get a signed copy.
          </p>
          <p className="mt-2 text-muted-foreground">
            The simplest protection is the one you control: remove names before
            you send. We never need them, and a report is no worse without them.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">What we keep afterwards</h2>
          <p className="mt-2 text-muted-foreground">
            The report itself, and the ordinary record of a sale: your email
            address, what you paid, and when. Dutch tax law requires invoice
            records to be kept for seven years, and we keep them.
          </p>
          <p className="mt-2 text-muted-foreground">
            We may keep anonymous statistics about how often a rule fires, to
            improve the rule. Counts and ratios, with no company, no name and no
            figure of yours attached.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Your rights</h2>
          <p className="mt-2 text-muted-foreground">
            You can ask what we hold, ask for it back, ask us to correct it, or
            ask us to delete it, by emailing{" "}
            <a href={`mailto:${seller.email}`} className="underline underline-offset-4">
              {seller.email}
            </a>
            . We answer within a few days rather than the month the GDPR allows,
            because there is very little to look up.
          </p>
          <p className="mt-2 text-muted-foreground">
            The controller is {seller.legalName}, Chamber of Commerce number{" "}
            {seller.kvk}, in the Netherlands. If you are unhappy with how we
            handled a request you can complain to the Autoriteit
            Persoonsgegevens.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Cookies and counting</h2>
          <p className="mt-2 text-muted-foreground">
            No advertising cookies and nothing that follows you off this site.
            We count visits in aggregate to know which pages are read, and we
            measure how quickly pages load using Vercel Speed Insights, which
            sets no cookie and records nothing that could be joined back into a
            browsing session. Nothing about your file, your figures or your
            findings is ever sent to an analytics service.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">The commercial terms</h2>
          <p className="mt-2 text-muted-foreground">
            What you get, what it costs and when we do not charge is on the{" "}
            <Link href="/terms" className="underline underline-offset-4">
              terms page
            </Link>
            , in the same plain language.
          </p>
        </div>
      </Container>
    </Section>
  );
}
