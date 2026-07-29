import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { REPORT_PRICE } from "@/lib/reports/findings";
import { routes } from "@/lib/routes";
import { seller } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who is behind this",
  description:
    "Stefan Wobben started a business at eighteen, sat through an annual accounts meeting he did not understand, and nearly lost the company twice for want of the same figures MarginGraph now reads.",
  alternates: { canonical: "/about" },
};

/**
 * The page that makes an unknown domain safe to send a balance sheet to.
 *
 * Not a mission statement. A name, a face, a phone number and the specific
 * failure that produced the product. Anyone can claim to understand margin;
 * the thing that is hard to fake is having nearly lost a company for want of
 * the exact figures this reads.
 */
export default function AboutPage() {
  return (
    <>
      <Section>
        <SectionHeader
          as="h1"
          eyebrow="Who is behind this"
          title="I sat in that meeting and understood nothing."
          description="MarginGraph is one person with a long habit of building companies and one uncomfortable memory. Here is the memory."
        />

        <Container className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
          <div>
            <Image
              src="/stefan-wobben.jpg"
              alt="Stefan Wobben"
              width={440}
              height={644}
              className="w-full max-w-xs rounded-lg border border-border object-cover"
              priority
            />
            <p className="mt-4 text-sm font-medium">Stefan Wobben</p>
            <p className="text-sm text-muted-foreground">
              Founder. {seller.legalName}, Chamber of Commerce {seller.kvk}.
            </p>
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              At eighteen I started Concept7, a web design agency, with friends.
              It read like an adventure story for a while, and then one day we
              had people on the payroll and clients with real budgets, and I was
              putting on a suit to go and see the accountant.
            </p>
            <p>
              He took me through the annual accounts. I understood none of it.
              Not the figures, and not the language they were being explained
              in. My head was somewhere else entirely: on the market, on where
              it was going, on what we could do next. I nodded in the right
              places and left none the wiser.
            </p>
            <p>
              Concept7 came close to going under twice. Not because the work was
              bad or the clients were unhappy, but because I found out what the
              figures were saying too late to do anything about it.
            </p>
            <p>
              When I finally did understand them, something unexpected happened:
              I fell for the arithmetic. That is the trap, and it is worth
              stating plainly. When a company feels good, when sales are coming
              in, the staff are happy and the customers keep returning, it feels
              as though all the ratios underneath must be fine too. They are
              often not. Nothing about a good week tells you what happened to
              the share of your turnover that a supplier is quietly taking.
            </p>
            <p>
              Since then I founded srprs.me, I am building Nooch, and I have
              helped dozens of companies, large and small, with strategy and
              with how they actually run.
            </p>
          </div>
        </Container>
      </Section>

      <Section bordered>
        <Container className="grid gap-6 lg:grid-cols-2">
          <Card className="gap-0 p-6">
            <h2 className="text-base font-semibold">
              Why €{REPORT_PRICE} and not nine hundred
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Because the part that used to take me days does not take days any
              more. The reading, the checking, the arithmetic and the comparing
              are automated end to end, and what is left is a fraction of what
              it cost me in time.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              The insight is worth far more than €{REPORT_PRICE}. I know that,
              because I have been paid a great deal more than that to find the
              same things by hand. But the price should sit where nobody has to
              think about it, so that an owner who is not sure whether anything
              is wrong can simply find out. That is the whole argument.
            </p>
          </Card>

          <Card className="gap-0 p-6">
            <h2 className="text-base font-semibold">What this is not</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Not your accountant. Not a consultant. Not another dashboard to
              log into. It is a layer of depth on the figures you already have,
              with suggestions attached, and you stay at the controls the whole
              way. Nobody here is going to run your business better than you do.
              The point is that you run it knowing what the numbers underneath
              are doing.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              If you want actual help with your company rather than a report,
              call me on{" "}
              <a href="tel:+31646340998" className="underline underline-offset-4">
                06 46340998
              </a>
              . We can talk through your case and see whether I have the time.
              That is a different conversation and it is priced like one.
            </p>
          </Card>
        </Container>
      </Section>

      <Section bordered>
        <Container className="max-w-2xl text-sm text-muted-foreground">
          <p>
            If you are about to send a file, the{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              privacy page
            </Link>{" "}
            says where it goes and what never happens to it, and{" "}
            <Link href={routes.whatWeFind} className="underline underline-offset-4">
              what we find
            </Link>{" "}
            shows both halves of a real analysis before you send anything.
            Otherwise:{" "}
            <a href={`mailto:${seller.email}`} className="underline underline-offset-4">
              {seller.email}
            </a>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
