import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { seller } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What happens to the file you send, how long we keep it, and what we never do with it.",
  alternates: { canonical: "/privacy" },
};

/**
 * Privacy, written for the one question that actually stops people.
 *
 * Nobody uploading a profit and loss is worried about cookie categories. They
 * are worried about where their numbers end up. That question is answered
 * first, in the first sentence, and the rest follows.
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
          <h2 className="text-base font-semibold">Your file</h2>
          <p className="mt-2 text-muted-foreground">
            It is used to produce your report and then deleted. It is not shared
            with third parties, it is not sold, and it is not used to train
            models.
          </p>
          <p className="mt-2 text-muted-foreground">
            We keep the file for as long as it takes to produce and deliver the
            report, and no longer than thirty days, so that we can answer a
            question about a report you already have. After that it is gone.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">What we keep afterwards</h2>
          <p className="mt-2 text-muted-foreground">
            The report itself, and the ordinary record of a sale: your email
            address, what you paid, and when. Dutch tax law requires us to keep
            invoice records for seven years, and we do.
          </p>
          <p className="mt-2 text-muted-foreground">
            We may keep anonymous, non-identifying statistics about how often a
            rule fires, in order to improve it. That means counts and ratios with
            no company, no name and no figure attached to anything of yours.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Who else sees it</h2>
          <p className="mt-2 text-muted-foreground">
            Our hosting provider, our payment provider for the payment itself,
            and the language model provider used to read documents. Each of them
            processes on our instruction and none of them receives your file for
            any purpose of their own. We do not use your file for anyone else&apos;s
            benchmarks.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Your rights</h2>
          <p className="mt-2 text-muted-foreground">
            You can ask what we hold, ask for it back, or ask us to delete it,
            by emailing{" "}
            <a href={`mailto:${seller.email}`} className="underline underline-offset-4">
              {seller.email}
            </a>
            . We answer within a few days rather than the month the GDPR allows,
            because there is very little to look up.
          </p>
          <p className="mt-2 text-muted-foreground">
            The controller is {seller.legalName}, Chamber of Commerce number{" "}
            {seller.kvk}. If you are unhappy with how we handled a request you can
            complain to the Autoriteit Persoonsgegevens.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">Cookies</h2>
          <p className="mt-2 text-muted-foreground">
            Only what is needed to keep the site working and to count visits in
            aggregate. No advertising cookies and nothing that follows you off
            this site.
          </p>
        </div>
      </Container>
    </Section>
  );
}
