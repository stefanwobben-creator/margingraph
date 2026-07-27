import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { collectionList } from "@/lib/content/collections";

export const metadata = {
  title: "Page not found",
  // A 404 must never be indexed, and Next does not set this for us.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="py-28 sm:py-36">
      <div className="max-w-prose-page">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          404
        </p>
        <h1 className="mt-4 text-display text-balance">
          That page does not exist
        </h1>
        <p className="mt-6 text-lead text-muted-foreground">
          It may have moved, or the link may be wrong. Everything published is
          reachable from the sections below.
        </p>

        <ul className="mt-10 flex flex-wrap gap-3">
          {collectionList.map((collection) => (
            <li key={collection.id}>
              <Button asChild variant="outline">
                <Link href={collection.basePath}>{collection.label}</Link>
              </Button>
            </li>
          ))}
          <li>
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
          </li>
        </ul>
      </div>
    </Container>
  );
}
