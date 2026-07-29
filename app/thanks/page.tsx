import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { seller } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your report is on its way.",
  alternates: { canonical: "/thanks" },
  robots: { index: false, follow: false },
};

/**
 * Where the payment provider sends people after they pay.
 *
 * It exists because the alternative is a customer landing back on the homepage
 * wondering whether the payment worked and what they just bought. The one job
 * of this page is to say what happens next and by when, and to give them a way
 * to complain if it does not.
 */
export default function ThanksPage() {
  return (
    <Section>
      <SectionHeader
        as="h1"
        eyebrow="Paid"
        title="Thank you. Your report is on its way."
        description="It comes by email, to the address you gave when you sent your file, within a few hours and usually much sooner."
      />

      <Container className="mt-10 max-w-2xl">
        <Card className="gap-0 p-6 text-sm">
          <h2 className="text-base font-semibold">What you will get</h2>
          <p className="mt-3 text-muted-foreground">
            Every finding in full: which line in your own file it sits on, the
            arithmetic behind the amount, and what to do about it, including how
            far you can go before a change starts costing you business.
          </p>

          <h2 className="mt-6 text-base font-semibold">If it does not arrive</h2>
          <p className="mt-3 text-muted-foreground">
            Check spam first, then write to{" "}
            <a
              href={`mailto:${seller.email}?subject=${encodeURIComponent("Report not received")}`}
              className="underline underline-offset-4"
            >
              {seller.email}
            </a>
            {" "}and we resend it. A report that does not turn up gets refunded
            without an argument.
          </p>

          <h2 className="mt-6 text-base font-semibold">If a figure is wrong</h2>
          <p className="mt-3 text-muted-foreground">
            Tell us which one. Every amount carries its own workings precisely so
            it can be checked, and a finding that does not survive checking gets
            corrected or refunded. That is in the{" "}
            <Link href="/terms" className="underline underline-offset-4">
              terms
            </Link>
            , not just here.
          </p>
        </Card>
      </Container>
    </Section>
  );
}
