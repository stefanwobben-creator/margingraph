import type { Metadata } from "next";
import Link from "next/link";

import { UploadForm } from "@/components/intake/upload-form";
import { Section, SectionHeader } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MINIMUM_WORTH,
  REPORT_PRICE,
} from "@/lib/reports/findings";
import { routes } from "@/lib/routes";
import { seller } from "@/lib/site";

export const metadata: Metadata = {
  title: "Send your figures",
  description:
    "Upload your profit and loss account and get the findings back by email. No account, no card details, and nothing to pay until you have seen what we found.",
  alternates: { canonical: "/send" },
};

/**
 * The intake.
 *
 * It was an email address, on the argument that an upload widget needs storage
 * and a queue and none of that makes the first ten reports better. That
 * argument was about our cost and ignored the sender's: writing an email is a
 * decision, choosing a file is a reflex, and the people who would have written
 * the email were the ones already convinced.
 *
 * The widget that replaced it still stores nothing. The file goes straight into
 * one email to us, which is what was happening anyway, minus the part where the
 * sender had to do it themselves.
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
    question: "How long does the money last?",
    send: "The same profit and loss account, plus what is in the bank today. One number.",
    why: "There is no cash in a profit and loss account, which is why your accounts can never answer this and your accountant does not volunteer it.",
  },
  {
    question: "Is this contract reasonable?",
    send: "The quote or agreement itself, and roughly what volume you do.",
    why: "A fee that is trivial at ten thousand units is fatal at one thousand. Volume decides which one you are.",
  },
];

export default function SendPage() {
  return (
    <>
      <Section>
        <SectionHeader
          as="h1"
          eyebrow="Intake"
          title="Send your figures"
          description={`Upload the file you already have. We read it, run the analysis, and reply with what we found. Only if you want the answers is there anything to pay, and if we find less than €${MINIMUM_WORTH} there is nothing to pay at all.`}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <Card className="gap-0 p-6">
            <UploadForm email={seller.email} />
          </Card>

          <Card className="gap-0 p-6">
            <h2 className="text-base font-semibold">How your file is handled</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="text-foreground">Encrypted on the way here.</span>{" "}
                The whole site is served over HTTPS, so the upload is encrypted
                in transit. Your browser will not let it be anything else.
              </li>
              <li>
                <span className="text-foreground">We store no copy.</span> There
                is no database and no file store behind this form. The file is
                held in memory just long enough to be attached to one email to{" "}
                {seller.email}, and that mailbox is the only place it exists on
                our side.
              </li>
              <li>
                <span className="text-foreground">Deleted when we are done.</span>{" "}
                Thirty days at the outside, sooner if you ask. One email from
                you and it is gone, because there is only one place to delete it
                from.
              </li>
              <li>
                <span className="text-foreground">
                  Not shared, not sold, not used to train anything.
                </span>{" "}
                Your figures are read to write your report. That is the only
                thing that happens to them.
              </li>
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              The long version is on the{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                privacy page
              </Link>
              . If your policy needs a signed processing agreement before you
              send anything, ask and you get one.
            </p>
          </Card>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
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
              One file is enough to start. Do not tidy it first; messy exports
              are the normal case. If a second file would let us say something
              useful we ask for it by name, rather than producing a thinner
              answer without telling you.
            </p>
          </Card>

          <Card className="gap-0 p-6">
            <h2 className="text-base font-semibold">What happens, in order</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="text-foreground">1. You send the file.</span>{" "}
                Excel, CSV or a text-based PDF, straight from your accounting
                package.
              </li>
              <li>
                <span className="text-foreground">2. We check we can read it.</span>{" "}
                Every subtotal has to reproduce from the lines above it. If one
                does not, we name the cell and ask, rather than guessing.
              </li>
              <li>
                <span className="text-foreground">
                  3. We reply with what we found.
                </span>{" "}
                The total, how many findings, and what each one is about. Free,
                and usually the same day.
              </li>
              <li>
                <span className="text-foreground">
                  4. €{REPORT_PRICE} if you want the answers.
                </span>{" "}
                One report with every chapter your file supports: the leaks,
                the downturn, the price change, the runway, the direction, and
                the questions for your accountant. Which line each finding sits
                on, the arithmetic, and what to do including how far you can
                safely go.
              </li>
            </ol>
            <Button asChild variant="outline" className="mt-6 self-start">
              <Link href={routes.whatWeFind}>See it run on a real company</Link>
            </Button>
          </Card>
        </div>
      </Section>
    </>
  );
}
