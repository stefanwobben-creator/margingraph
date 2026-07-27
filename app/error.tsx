"use client";

import { useEffect } from "react";
import Link from "next/link";

import { trackEvent } from "@/lib/analytics";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Every page on this site is statically generated,
 * so reaching this usually means a client-side failure rather than a data
 * problem — which is why retrying is offered first.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackEvent("error_occurred", {
      message: error.message,
      digest: error.digest,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }, [error]);

  return (
    <Container className="py-28 sm:py-36">
      <div className="max-w-prose-page">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Error
        </p>
        <h1 className="mt-4 text-display text-balance">Something broke</h1>
        <p className="mt-6 text-lead text-muted-foreground">
          This page failed to render. Trying again usually works; if it does
          not, the sections below are unaffected.
        </p>

        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
