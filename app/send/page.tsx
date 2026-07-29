import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MINIMUM_WORTH, REPORT_PRICE } from "@/lib/reports/findings";
import { routes } from "@/lib/routes";
import { seller } from "@/lib/site";

export const metadata: Metadata = {
  title: "Send your file",
  description:
    "What to send, where to send it, and what happens next. No account, no form, no card details until there is something worth paying for.",
  alternates: { canonical: "/send" },
};

/**
 * The intake, done by email on purpose.
 *
 * An upload widget needs storage, a queue and a key, and none of that makes the
 * first ten reports better. What it would do is put a broken form in front of
 * people before there is anything behind it. Email is the version we can
 * actually honour today, and it says so plainly rather than pretending to be
 * automated.
 */
const WHAT_TO_SEND = [
  {
    question: "Where is my margin leaking?",
    send: "Profit and loss for the current period, plus the budget or the same period last year.",
    why: "Two periods is what lets us see a cost line that stopped moving with your revenue.",
  },
  {
    question: "What is my business worth?",
    send: "Annual accounts for the last three years including balance sheets, and what the owner takes out of the business.",
    why: "Earnings have to be normalised for owner pay before any multiple means anything.",
  },
  {
    question: "Is this contract reasonable?",
    send: "The quote or agreement itself, and roughly what volume you do.",
    why: "A fee that is trivial at ten thousand units is fatal at one thousand. Volume decides which one you are.",
  },
];

export default function SendPage() {
  const mailto = `mailto:${seller.email}?subject=${encodeURIComponent("File for analysis")}`;

  return (
    <>
      <Section>
        <SectionHeader
          as="h1"
          eyebrow="Intake"
          title="Send your file"
          description={`Email it. No account, no form, no card details. We read it, run the analysis, and reply with what we found. Only if you want the answers is there anything to pay, and if we find less than €${MINIMUM_WORTH} there is nothing to pay at all.`}
        />

        <Container className="mt-10">
          <Card className="gap-0 p-6">
            <h2 className="text-base font-semibold">What to send</h2>
            <div className="mt-5 space-y-6">
              {WHAT_TO_SEND.map((item) => (
                <div key={item.question}>
                  <p className="font-medium">{item.question}</p>
                  <p className="mt-1 text-sm">{item.send}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.why}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              One file is enough to start. If a second one would let us say
              something useful we ask for it by name, rather than producing a
              thinner answer without telling you.
            </p>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-6 lg:grid-cols-2">
          <Card className="gap-0 p-6">
            <h2 className="text-base font-semibold">What happens, in order</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="text-foreground">1. You email the file.</span>{" "}
                Excel, CSV or a text-based PDF. Do not tidy it first; messy
                exports are the normal case.
              </li>
              <li>
                <span className="text-foreground">2. We check we can read it.</span>{" "}
                Every subtotal has to reproduce from the lines above it. If one
                does not, we name the cell and ask, rather than guessing.
              </li>
              <li>
                <span className="text-foreground">3. We reply with what we found.</span>{" "}
                The total, how many findings, and what each one is about. Free,
                and usually the same day.
              </li>
              <li>
                <span className="text-foreground">
                  4. €{REPORT_PRICE} if you want the answers.
                </span>{" "}
                Which line each finding sits on, the arithmetic, and what to do
                including how far you can safely go.
              </li>
            </ol>
            <Button asChild size="lg" className="mt-6 self-start">
              <a href={mailto}>Email {seller.email}</a>
            </Button>
          </Card>

          <Card className="gap-0 p-6">
            <h2 className="text-base font-semibold">Honest about the machinery</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              There is no upload widget yet. Building one before the first ten
              reports would put a form in front of people with nothing behind it,
              so the intake is an email address and a person reading it.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              The analysis itself is not manual. The reading check and the rules
              are code, they are deterministic, and you can watch both halves run
              on a real company&apos;s accounts before you send anything.
            </p>
            <Button asChild variant="outline" className="mt-6 self-start">
              <Link href={routes.whatWeFind}>See it run</Link>
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">
              Your file is used to produce your report and then deleted. The{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                privacy page
              </Link>{" "}
              says exactly what that means.
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
