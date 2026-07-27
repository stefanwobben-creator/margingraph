import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function FooterCta() {
  return (
    <section className="border-t border-border py-24 sm:py-32">
      <Container className="flex flex-col items-start gap-8 sm:items-center sm:text-center">
        <h2 className="max-w-2xl text-title text-balance">
          Ready to make better decisions?
        </h2>
        <Button asChild size="lg">
          <Link href={routes.reports}>Browse all reports</Link>
        </Button>
      </Container>
    </section>
  );
}
