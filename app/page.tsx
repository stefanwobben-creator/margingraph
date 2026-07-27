import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/**
 * Placeholder only — exists so the foundation can be verified in a browser.
 * Replace when the first real section is built.
 */
export default function Home() {
  return (
    <Container className="py-24">
      <div className="max-w-prose-page">
        <p className="text-sm font-medium tracking-wide text-accent-brand uppercase">
          Foundation
        </p>
        <h1 className="mt-4 text-display">MarginGraph</h1>
        <p className="mt-6 text-lead text-muted-foreground">
          Project foundation is in place. Typography, spacing, container widths
          and the component layer are wired up. No pages have been built yet.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button>Primary action</Button>
          <Button variant="outline">Secondary action</Button>
        </div>

        <hr className="my-14 border-border" />

        <h2 className="text-title">Type scale</h2>
        <p className="mt-3 text-muted-foreground">
          Body copy sits at 16px with a 1.7 line height and a maximum measure of
          roughly 70 characters, which is the width of this paragraph. Links use
          the single{" "}
          <Link
            href="/"
            className="text-accent-brand underline underline-offset-4 hover:opacity-80"
          >
            accent colour
          </Link>{" "}
          and nothing else does.
        </p>

        <h3 className="mt-10 text-heading">Section heading</h3>
        <p className="mt-3 text-muted-foreground">
          Monospace is available for identifiers and figures:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
            max-w-page = 1200px
          </code>
        </p>
      </div>
    </Container>
  );
}
