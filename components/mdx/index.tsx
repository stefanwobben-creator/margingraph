import Link from "next/link";
import type { MDXComponents } from "mdx/types";

import {
  Cascade,
  Checklist,
  Comparison,
  Cta,
  Figure,
  Metrics,
  ProsCons,
  Quote,
  Video,
} from "@/components/mdx/blocks";
import { Callout, Info, Success, Warning } from "@/components/mdx/callout";
import { CheckoutLink } from "@/components/commerce/checkout-link";
import { Faq } from "@/components/mdx/faq-block";
import { WhatWeFind } from "@/components/mdx/what-we-find";
import { OutboundLink } from "@/components/analytics/outbound-link";
import { BusinessValuationPreview } from "@/components/reports/business-valuation-preview";
import { ReportPreview } from "@/components/report-preview";

/**
 * Everything an author may use inside a `.mdx` file.
 *
 * Adding a component here makes it available in all 5,000 future documents
 * without touching a single one of them. Removing one breaks every document
 * that uses it — so treat this map as a published API.
 */
export const mdxComponents: MDXComponents = {
  /* Element overrides — keep markdown output on the design system. */
  a: ({ href = "", children, ...props }) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    const className =
      "text-accent-brand underline underline-offset-4 hover:opacity-80";

    if (isInternal) {
      return (
        <Link href={href} className={className} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <OutboundLink href={href} className={className} {...props}>
        {children}
      </OutboundLink>
    );
  },

  /* Content components. */
  Callout,
  Info,
  Warning,
  Success,
  Quote,
  Checklist,
  Comparison,
  ProsCons,
  Metrics,
  Cascade,
  Cta,
  Figure,
  Image: Figure,
  Video,
  Faq,
  WhatWeFind,

  /* Commerce. A decision page without one of these cannot take money. */
  CheckoutLink,

  /* Product previews, usable from any document. */
  ReportPreview,
  BusinessValuationPreview,
};
