import type { Metadata } from "next";
import Link from "next/link";

import { Section, SectionHeader } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MINIMUM_WORTH, REPORT_PRICE } from "@/lib/reports/findings";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "For companies that ship things",
  description:
    "You sell physical goods and somebody else picks and packs them. Three things leak margin in businesses built that way, and all three are visible in a profit and loss account you already have.",
  alternates: { canonical: "/for/ecommerce" },
};

/**
 * One page for one kind of company.
 *
 * Everything else on this site is written for anybody with figures, which is
 * the correct scope for the engine and the wrong scope for a first customer.
 * Nobody recognises themselves in "any business". They recognise themselves in
 * "you sell things and somebody else picks and packs them".
 *
 * The choice of niche is not a marketing preference. Every rule in the engine
 * was found by hand on exactly this shape of company: the recovery gap only
 * exists where goods are shipped, and the fulfilment step of the cascade only
 * exists where fulfilment is a line in the accounts. Writing for the companies
 * the product is already best at is honesty, not positioning.
 *
 * The figures below are from a real Dutch trading company, anonymised, and
 * every one of them was produced by the shipped engine rather than typed here.
 */
const WHAT_WE_FIND = [
  {
    title: "Freight you pay for and do not bill on",
    body:
      "You charge delivery at a rate somebody set years ago. Your carrier has raised prices since, more than once. The two lines drift apart quietly, because neither of them looks wrong on its own.",
    real:
      "One trading company recovered 55.5% of its outbound freight from customers. €81,800 paid, €45,400 billed on. Full recovery is €36,400 a year, and the first sensible step, five points, is worth €4,090 and can cost half a percent of turnover in lost orders before it stops paying.",
  },
  {
    title: "A fulfilment contract that did not notice you got smaller",
    body:
      "Pick, pack, storage and handling should follow volume down. Contracts frequently do not, because of a minimum commitment nobody has read since it was signed.",
    real:
      "In one quarter turnover came in 46% under budget while fulfilment stayed almost exactly on budget in euros, so nothing was flagged. As a share of the money left after buying, it went from 19 cents to 37.",
  },
  {
    title: "A subtotal in your own file that does not add up",
    body:
      "Before anything else runs, every subtotal is added back up from the lines above it. When one does not reconcile, it is usually a sign typed the wrong way round, and it has been in every report you have steered by since.",
    real:
      "We name the cell and the single flip that closes the gap, rather than deciding what you meant. If the file cannot be read, we say so and charge nothing.",
  },
];

const CHECK_YOURSELF = [
  "Add up what you paid for outbound freight last year, and what you billed customers for delivery. Divide the second by the first. Under 80% is a conversation.",
  "Take your fulfilment costs as a percentage of turnover this year and last year. If turnover fell and that percentage rose, your contract is fixed where you thought it was variable.",
  "Take gross profit, not turnover, and express every cost against that. Turnover was never your money. What you bought and resold belonged to somebody else.",
  "Take one subtotal in your management accounts and add up the lines above it by hand. Most people find it reconciles. The ones who do not, find something.",
];

export default function EcommercePage() {
  return (
    <>
      <Section>
        <SectionHeader
          as="h1"
          eyebrow="For companies that ship things"
          title="You sell goods. Somebody else picks and packs them. That is where the margin goes."
          description="Between one and ten million in turnover, an outsourced warehouse, and a profit and loss account that looks fine every month. Three things leak in businesses built this way, and all three are already visible in a file you have."
        />

        <div className="mt-10">
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={routes.send}>Send your figures</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.whatWeFind}>See a real analysis first</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free until you have seen what we found. €{REPORT_PRICE} to unlock it,
            and nothing at all if we find less than €{MINIMUM_WORTH}.
          </p>
        </div>
      </Section>

      <Section bordered>
        <div className="space-y-6">
          <h2 className="text-heading">
            What we find in companies shaped like yours
          </h2>
          {WHAT_WE_FIND.map((item) => (
            <Card key={item.title} className="gap-0 p-6">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
              <p className="mt-3 border-l-2 border-border pl-4 text-sm">
                {item.real}
              </p>
            </Card>
          ))}
          <p className="text-sm text-muted-foreground">
            Those amounts are from real management accounts, anonymised, and
            every one of them was produced by the same code that would read your
            file. Yours will be different. The point is the shape, not the
            amount.
          </p>
        </div>
      </Section>

      <Section bordered>
        <div className="max-w-2xl">
          <h2 className="text-heading">Four things you can check this afternoon</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Without us, and without sending anything. If all four come back
            clean, you have spent twenty minutes and learned that your figures
            are in order, which is worth knowing and worth nothing to us.
          </p>
          <ol className="mt-6 space-y-4">
            {CHECK_YOURSELF.map((item, index) => (
              <li key={item} className="flex gap-4 text-sm">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section bordered>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="gap-0 p-6">
            <h2 className="text-base font-semibold">What to send</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your profit and loss account for the current period, plus the
              budget or the same period last year. Two periods is what lets us
              see a cost that stopped moving with your revenue. Excel, CSV or a
              text-based PDF, straight out of your accounting package. Do not
              tidy it first.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Add what is in the bank today and we can tell you how long the
              money lasts as well. There is no cash in a profit and loss
              account, which is why your accounts can never answer that.
            </p>
            <Button asChild className="mt-6 self-start">
              <Link href={routes.send}>Send your figures</Link>
            </Button>
          </Card>

          <Card className="gap-0 p-6">
            <h2 className="text-base font-semibold">What this is not</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Not your accountant, not a consultant, and not another dashboard
              to log into. Your accounts are built to arrive at a taxable profit
              in a prescribed order, and they do that properly. Steering needs
              the same costs sorted by how close they sit to the sale, measured
              against the money that is actually yours. That is the whole
              difference, and it is the reason this exists.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Every figure we produce carries its own workings so you can redo
              it in ten seconds. A finding that does not survive checking gets
              corrected or refunded, which is in the{" "}
              <Link href="/terms" className="underline underline-offset-4">
                terms
              </Link>
              , not just here.
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
