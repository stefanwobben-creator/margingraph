import type { Metadata } from "next";
import Link from "next/link";

import { Cascade } from "@/components/mdx/blocks";
import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "What is a margin graph?",
  description:
    "The idea behind the name: your accounts sort costs for the tax office. Sort the same numbers by distance from the sale, measure them against the money that is actually yours, and your company becomes a picture you can steer by.",
  alternates: { canonical: "/idea" },
};

/**
 * The concept page. The whitepaper, without the PDF.
 *
 * The product is named after an idea that, until this page, was explained
 * nowhere: not in the hero, not on the about page, not in a guide. A visitor
 * could buy a report without ever learning what a margin graph is, which
 * means the name was decoration. This page makes it a claim.
 *
 * Deliberately short sentences and no formulas. The reader this exists for is
 * the owner in the founder's story: smart, busy, and never taught the two
 * conventions that make accounts unreadable. The whole page argues one thing
 * and repeats it three ways, because one idea said clearly beats five said
 * quickly.
 */
const PRINCIPLES = [
  {
    title: "Turnover is not your money",
    body: "What you bought and resold was never yours. It passed through your account on the way to a supplier. Gross profit, what is left after buying, is the first money that actually belongs to you. So every cost should be measured against that, not against turnover. Measured against turnover, every cost looks small, because you are dividing by money that was never yours to spend.",
  },
  {
    title: "Sort costs by distance from the sale",
    body: "Your ledger sorts costs by account number, which is the order a bookkeeper files them in. A margin graph sorts the same costs by how close they sit to the sale: what it cost to buy, to deliver, to win the order, and to keep the company standing. Four steps. Each one fails differently, each one is fixed differently, and each one belongs to a different conversation: your supplier, your logistics partner, your marketing, yourself.",
  },
  {
    title: "Your only honest benchmark is your own last period",
    body: "Industry averages mix a barber, a wholesaler and a software company into one number, dominated by firms a hundred times your size. We do not use them. The comparison that cannot lie to you is your own company against your own company, one period earlier, measured the same way both times. Which step widened, by how much, and what that costs at your turnover.",
  },
] as const;

const RULES = [
  {
    title: "The arithmetic has to close first",
    body: "Before anything runs, every subtotal in your file is added back up from the lines above it. If one does not reconcile, we name the cell and ask. We never quietly decide what you meant.",
  },
  {
    title: "Every figure carries its workings",
    body: "Each amount in a report comes with the sum that produced it, so you can redo it in ten seconds. A number you cannot check is a number you should not act on, including ours.",
  },
  {
    title: "The analysis runs before the payment",
    body: "You see what we found, and how much it is worth, before anything is for sale. Under €90 found, no payment screen appears. The guarantee is the order of operations, not a refund policy.",
  },
] as const;

export default function IdeaPage() {
  return (
    <>
      <Section>
        <SectionHeader
          as="h1"
          eyebrow="The idea"
          title="Your company can be drawn."
          description="A margin graph is a picture of where every euro of a sale goes, in the order it leaves, measured against the money that is actually yours. It is made from figures you already have. Almost no small company has ever seen its own."
        />

        <Container className="mt-10 max-w-2xl space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            Every owner has sat in the meeting. The accountant walks through
            the annual accounts, the words are all English or all Dutch, and
            none of it lands. Most people conclude they are bad with numbers.
          </p>
          <p className="text-foreground">
            They are not. The numbers are in the wrong order, measured against
            the wrong base, for a different reader.
          </p>
          <p>
            A profit and loss account exists to arrive at taxable profit, in a
            sequence the law prescribes, for the tax office. It does that job
            properly. But the figures you need to steer a company are not the
            figures your bookkeeper gives you. Not worse figures, not wrong
            ones. The same ones, rearranged.
          </p>
          <p>
            That rearrangement is a margin graph. Two moves, both simple.
          </p>
        </Container>
      </Section>

      <Section bordered>
        <Container className="space-y-6">
          <h2 className="text-heading">The three principles</h2>
          {PRINCIPLES.map((principle, index) => (
            <Card key={principle.title} className="gap-0 p-6">
              <h3 className="flex items-baseline gap-3 text-base font-semibold">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {principle.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {principle.body}
              </p>
            </Card>
          ))}
        </Container>
      </Section>

      <Section bordered>
        <Container className="max-w-2xl">
          <h2 className="text-heading">What one looks like</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            A real quarter at a real trading company, anonymised. Turnover came
            in 46% under budget. In euros, every cost line sat close to plan,
            so the accounting package flagged nothing. Drawn as a margin graph,
            the same quarter reads:
          </p>

          <Cascade
            title="Of every euro kept after buying"
            items={[
              { label: "Fulfilling the order", value: "37 cents", note: "was 19" },
              { label: "Winning the order", value: "5 cents", note: "was 3" },
              { label: "Running the company", value: "73 cents", note: "was 41" },
              { label: "Left over", value: "−15 cents" },
            ]}
          />

          <p className="mt-3 text-sm text-muted-foreground">
            One line tells the story. Fulfilment nearly doubled its share while
            staying on budget in euros: a contract that did not notice the
            company got smaller. That is not a cost problem, it is one phone
            call, and it was invisible in the ledger order.
          </p>
        </Container>
      </Section>

      <Section bordered>
        <Container className="space-y-6">
          <h2 className="text-heading">The three rules we hold ourselves to</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            An idea about honest numbers only counts if the product is held to
            the same standard.
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            {RULES.map((rule) => (
              <Card key={rule.title} className="gap-0 p-6">
                <h3 className="text-base font-semibold">{rule.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {rule.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section bordered>
        <Container className="max-w-2xl space-y-5 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-heading text-foreground">Where the idea comes from</h2>
          <p>
            None of it is invented here, and we would distrust it if it were.
            Sorting costs by contribution is management accounting older than
            the computer. Measuring people against gross profit is Greg
            Crabtree&apos;s labour efficiency ratio. Refusing benchmarks that
            were not measured on companies like yours is ordinary statistical
            honesty.
          </p>
          <p>
            What MarginGraph adds is the part that never got done: a machine
            that reads the file you already have, draws the graph, and points
            at the step that moved. The method was always available. It just
            cost a consultant&apos;s day rate, so almost nobody at €2m turnover
            ever saw it. Now it costs €9, and the first look is free.
          </p>
          <p>
            The longer version, with worked examples for goods and services
            companies, is in{" "}
            <Link
              href="/guides/where-your-margin-actually-goes"
              className="underline underline-offset-4"
            >
              the guide on where your margin actually goes
            </Link>
            .
          </p>
        </Container>
      </Section>

      <Section bordered>
        <Card className="gap-0 p-8">
          <h2 className="text-heading text-balance">See your own margin graph</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Send the profit and loss account you already have. We draw the
            graph, run the analysis, and show you what we found before anything
            is for sale.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href={routes.send}>Send your figures</Link>
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}
