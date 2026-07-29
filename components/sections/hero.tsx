import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ReportPreview } from "@/components/report-preview";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { seller } from "@/lib/site";

export function Hero() {
  return (
    <section className="py-20 sm:py-28 lg:py-32">
      <Container className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
        <div>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Send a file · See what is in it · Pay only if it is worth it
          </p>

          {/*
            The old headline said "every important business decision starts with
            one question" and never named the product. A visitor has about four
            seconds and they were spent on a sentiment. This one states the
            outcome, the price and the guarantee before anything is asked of
            them.
          */}
          {/*
            "what they are worth" is valuation language, and the product this
            hero sells is margin. The headline pointed at the other report.
          */}
          <h1 className="mt-6 text-display text-balance">
            We read your figures and show you where the money is going.
          </h1>

          <p className="mt-6 max-w-xl text-lead text-muted-foreground">
            For owner-run companies between one and ten million in turnover.
            Send the management accounts you already have. We check every
            subtotal adds up, run the analysis, and show you what we found
            before anything is for sale. €9 for the answers, and if we find
            less than €90 worth acting on there is no payment screen at all.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href={routes.send}>Send a file</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.whatWeFind}>See it on a real company first</Link>
            </Button>
          </div>

          {/*
            The page asks a stranger to send their company's accounts, and
            until now it answered the obvious objection nowhere: who is this,
            and where does my file end up. Both answers already existed, on
            /about and /privacy, which is two clicks from the moment the
            question is actually being asked. Silence at that moment does not
            read as neutral. It reads as offshore scraper.
          */}
          <div className="mt-10 flex items-start gap-4 border-t border-border pt-6">
            <Image
              src="/stefan-wobben.jpg"
              alt=""
              width={88}
              height={88}
              className="size-11 shrink-0 rounded-full object-cover object-top"
            />
            <p className="text-sm text-muted-foreground">
              Read by Stefan Wobben in person. {seller.legalName}, Chamber of
              Commerce {seller.kvk}, the Netherlands. Your file is stored
              nowhere, deleted within thirty days, never shared and never used
              to train anything.{" "}
              <Link href={routes.about} className="underline underline-offset-4">
                Who that is
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                what happens to your file
              </Link>
              .
            </p>
          </div>
        </div>

        <ReportPreview className="w-full lg:justify-self-end" />
      </Container>
    </section>
  );
}
