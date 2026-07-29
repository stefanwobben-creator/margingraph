import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ReportPreview } from "@/components/report-preview";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

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
          <h1 className="mt-6 text-display text-balance">
            We read your figures and tell you what they are worth.
          </h1>

          <p className="mt-6 max-w-xl text-lead text-muted-foreground">
            Send your management accounts, annual accounts or a supplier quote.
            We check every subtotal adds up, run the analysis, and show you what
            we found before anything is for sale. €9 for the answers, and
            nothing at all if we find less than €90.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href={routes.send}>Send a file</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.whatWeFind}>See it on a real company first</Link>
            </Button>
          </div>
        </div>

        <ReportPreview className="w-full lg:justify-self-end" />
      </Container>
    </section>
  );
}
