import NextImage from "next/image";
import { Check, Minus, Plus, X } from "lucide-react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { CheckoutLink } from "@/components/commerce/checkout-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */

export function Quote({
  children,
  cite,
}: {
  children: React.ReactNode;
  cite?: string;
}) {
  return (
    <figure className="my-10 border-l-2 border-accent-brand pl-6">
      <blockquote className="text-lead text-balance [&>p]:my-0">
        {children}
      </blockquote>
      {cite ? (
        <figcaption className="mt-3 text-sm text-muted-foreground">
          — {cite}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="my-8 space-y-3 not-prose">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent-brand" />
          <span className="text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */

export function Comparison({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | boolean)[][];
}) {
  return (
    <div className="my-10 overflow-x-auto">
      <Table className="min-w-[32rem]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column, index) => (
              <TableHead
                key={column}
                className={index === 0 ? "w-[12rem]" : "text-foreground"}
              >
                {index === 0 ? <span className="sr-only">{column}</span> : column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={String(row[0])} className="hover:bg-transparent">
              {row.map((cell, index) => (
                <TableCell
                  key={index}
                  className={cn(
                    "align-top",
                    index === 0 ? "text-muted-foreground" : "",
                  )}
                >
                  {typeof cell === "boolean" ? (
                    cell ? (
                      <Check aria-label="Yes" className="size-4 text-accent-brand" />
                    ) : (
                      <Minus aria-label="No" className="size-4 text-muted-foreground" />
                    )
                  ) : (
                    cell
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function ProsCons({
  pros,
  cons,
  prosTitle = "Arguments for",
  consTitle = "Arguments against",
}: {
  pros: string[];
  cons: string[];
  prosTitle?: string;
  consTitle?: string;
}) {
  return (
    <div className="my-10 grid gap-5 sm:grid-cols-2 not-prose">
      {[
        { title: prosTitle, items: pros, Icon: Plus, tone: "text-accent-brand" },
        { title: consTitle, items: cons, Icon: X, tone: "text-muted-foreground" },
      ].map(({ title, items, Icon, tone }) => (
        <Card key={title} className="gap-0 p-6">
          <h3 className="text-sm font-medium">{title}</h3>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
                <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", tone)} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function Metrics({
  items,
}: {
  items: { label: string; value: string; note?: string }[];
}) {
  return (
    <dl className="my-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 not-prose">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-6 py-6">
          <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {item.label}
          </dt>
          <dd className="mt-2 text-heading tabular-nums">{item.value}</dd>
          {item.note ? (
            <dd className="mt-1.5 text-sm text-muted-foreground">{item.note}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * A vertical cascade: label, amount, and what it was before.
 *
 * `Metrics` puts three figures side by side, which is right for three
 * unrelated numbers and wrong for a sequence. A cascade is read downwards,
 * because each line is what is left after the line above it, and laying it out
 * in a grid destroys the one property that makes it worth reading.
 */
export function Cascade({
  title,
  items,
}: {
  title?: string;
  items: { label: string; value: string; note?: string }[];
}) {
  return (
    <figure className="my-10 overflow-hidden rounded-lg border border-border not-prose">
      {title ? (
        <figcaption className="border-b border-border bg-muted/40 px-5 py-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {title}
        </figcaption>
      ) : null}
      <dl className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-4 px-5 py-3">
            <dt className="text-sm">{item.label}</dt>
            <dd className="flex items-baseline gap-3 text-sm tabular-nums">
              {item.note ? (
                <span className="text-xs text-muted-foreground">{item.note}</span>
              ) : null}
              <span className="font-medium">{item.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * A call to action. Two shapes, and only two.
 *
 * `href` sends the reader somewhere on the site. `report` sells something and
 * renders a checkout button instead. The union type makes the combination that
 * would silently do nothing — both, or neither — fail to compile, because a
 * call to action that goes nowhere is invisible in review and expensive live.
 */
type CtaBase = {
  title: string;
  body?: string;
  label: string;
  location?: string;
};

type CtaLink = CtaBase & {
  href: string;
  report?: never;
  /** Defaults to the slug in `href` when it points at a decision page. */
  reportSlug?: string;
};

type CtaBuy = CtaBase & {
  /** A key in lib/payments/catalogue.ts. */
  report: string;
  href?: never;
  reportSlug?: never;
};

export function Cta(props: CtaLink | CtaBuy) {
  const { title, body, label, location = "content" } = props;

  return (
    <Card className="my-12 gap-0 p-8 not-prose">
      <h3 className="text-heading text-balance">{title}</h3>
      {body ? <p className="mt-3 text-muted-foreground">{body}</p> : null}
      <div className="mt-6">
        {props.report !== undefined ? (
          <CheckoutLink
            report={props.report}
            label={label}
            location={location}
          />
        ) : (
          <Button asChild>
            <TrackedLink
              href={props.href}
              reportSlug={props.reportSlug}
              location={location}
            >
              {label}
            </TrackedLink>
          </Button>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

export function Figure({
  src,
  alt,
  caption,
  width = 1280,
  height = 720,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="my-10 not-prose">
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full rounded-lg border border-border"
      />
      {caption ? (
        <figcaption className="mt-3 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Privacy-preserving embed: no third-party script, no cookies until the
 * visitor clicks. Uses youtube-nocookie.
 */
export function Video({
  id,
  title,
  provider = "youtube",
}: {
  id: string;
  title: string;
  provider?: "youtube" | "vimeo";
}) {
  const src =
    provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : `https://player.vimeo.com/video/${id}`;

  return (
    <figure className="my-10 not-prose">
      <div className="aspect-video overflow-hidden rounded-lg border border-border">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        {title}
      </figcaption>
    </figure>
  );
}
